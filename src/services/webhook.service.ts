// src/services/webhook.service.ts
import { PrismaClient, PaymentStatus, Segment } from '@prisma/client';
import redis from '../config/redis';
import { verifyNotificationSignature } from './midtrans.service';
import logger from '../config/logger';

const prisma = new PrismaClient();

type MidtransNotif = {
  transaction_status: string;
  order_id: string;
  gross_amount: string;
  status_code: string;
  signature_key: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_time?: string;
};

function mapMidtransToPaymentStatus(s: string): PaymentStatus {
  switch (s) {
    case 'settlement':
    case 'capture':
    case 'success':
      return 'COMPLETED';
    case 'pending':
      return 'PENDING';
    case 'deny':
    case 'cancel':
    case 'failure':
      return 'FAILED';
    case 'expire':
      return 'FAILED';
    case 'refund':
      return 'REFUNDED';
    default:
      return 'FAILED';
  }
}

export async function handleMidtransWebhook(payload: MidtransNotif) {
  // 1) Verify signature
  const valid = verifyNotificationSignature({
    order_id: payload.order_id,
    status_code: payload.status_code,
    gross_amount: payload.gross_amount,
    signature_key: payload.signature_key
  });
  if (!valid) {
    logger.error(`Invalid Midtrans signature for orderId=${payload.order_id}`);
    throw new Error('Invalid midtrans signature');
  }

  const orderId = payload.order_id;
  const status = mapMidtransToPaymentStatus(payload.transaction_status);
  logger.info(`Webhook received: orderId=${orderId}, mappedStatus=${status}`);

  // 2) Idempotency check
  const existing = await prisma.payment.findUnique({
    where: { orderId }
  });
  if (existing) {
    if (existing.status !== status) {
      await prisma.payment.update({
        where: { orderId },
        data: {
          status,
          rawPayload: payload as any,
          paidAt: status === 'COMPLETED' ? new Date() : existing.paidAt
        }
      });
      logger.info(`Payment updated for orderId=${orderId} → status=${status}`);
    }
    return existing;
  }

  // 3) Try read from Redis
  const cacheRaw = await redis.get(`pay:${orderId}`);
  if (!cacheRaw) {
    logger.warn(`Cache missing for orderId=${orderId}, fallback to Payment-only`);
    return prisma.payment.create({
      data: {
        orderId,
        email: '', // unknown
        amount: Math.floor(parseFloat(payload.gross_amount) || 0),
        currency: 'IDR',
        status,
        rawPayload: payload as any
      }
    });
  }

  const cache = JSON.parse(cacheRaw) as {
    programId: string;
    email: string;
    name: string;
    phone: string | null;
    institution: string | null;
    segment: Segment | null;
    programPackage: string | null;
    userId: number | null;
    memberId: string | null;
    source: 'MEMBER' | 'NON_MEMBER' | 'ADMIN';
    amount: number;
    currency: 'IDR';
    method: string;
  };

  // 4) If not COMPLETED yet → persist Payment only
  if (status !== 'COMPLETED') {
    logger.info(`Payment pending/failed for orderId=${orderId}, status=${status}`);
    return prisma.payment.create({
      data: {
        orderId,
        email: cache.email,
        amount: cache.amount,
        currency: cache.currency,
        status,
        rawPayload: payload as any
      }
    });
  }

  // 5) Commit Registration + Payment atomically
  const result = await prisma.$transaction(async (tx) => {
    const registration = await tx.programRegistration.upsert({
      where: {
        email_programId: {
          email: cache.email,
          programId: cache.programId
        }
      },
      update: {},
      create: {
        programId: cache.programId,
        memberId: cache.memberId ?? undefined,
        userId: cache.userId ?? undefined,
        email: cache.email,
        name: cache.name,
        phone: cache.phone ?? undefined,
        institution: cache.institution ?? undefined,
        segment: cache.segment ?? null,
        programPackage: cache.programPackage ?? undefined,
        source: cache.source
      }
    });

    const payment = await tx.payment.create({
      data: {
        orderId,
        email: cache.email,
        amount: cache.amount,
        currency: cache.currency,
        method: (cache.method as any) || (payload.payment_type?.toUpperCase() as any) || 'QRIS',
        gateway: 'MIDTRANS',
        status,
        rawPayload: payload as any,
        paidAt: new Date(),
        registrationId: registration.id,
        memberId: cache.memberId ?? undefined
      }
    });

    return { registration, payment };
  });

  logger.info(`Payment committed & cache cleared for orderId=${orderId}`);
  await redis.del(`pay:${orderId}`);

  return result;
}
