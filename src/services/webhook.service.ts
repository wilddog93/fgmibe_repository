// src/services/webhook.service.ts
import { PrismaClient, PaymentStatus, RegistrationSource, Segment } from '@prisma/client';
import redis from '../config/redis';
import { verifyNotificationSignature } from './midtrans.service';

const prisma = new PrismaClient();

type MidtransNotif = {
  transaction_status: string; // 'settlement','pending','expire','cancel','deny','capture','success'
  order_id: string;
  gross_amount: string; // string number
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
  // 1) verify signature
  const valid = verifyNotificationSignature({
    order_id: payload.order_id,
    status_code: payload.status_code,
    gross_amount: payload.gross_amount,
    signature_key: payload.signature_key
  });
  if (!valid) {
    throw new Error('Invalid midtrans signature');
  }

  // 2) idempotency: is payment already persisted?
  const existing = await prisma.payment.findUnique({
    where: { orderId: payload.order_id }
  });

  const status = mapMidtransToPaymentStatus(payload.transaction_status);

  if (existing) {
    // Optional: update status if changed
    if (existing.status !== status) {
      await prisma.payment.update({
        where: { orderId: payload.order_id },
        data: {
          status,
          rawPayload: payload as any,
          paidAt: status === 'COMPLETED' ? new Date() : existing.paidAt
        }
      });
    }
    return existing;
  }

  // 3) not in DB yet → read cache
  const cacheRaw = await redis.get(`pay:${payload.order_id}`);
  if (!cacheRaw) {
    // No cache – as a safeguard, you could log and stop, or create Payment only (without registration) for reconciliation.
    // We'll create Payment-only to not lose the transaction audit:
    return prisma.payment.create({
      data: {
        orderId: payload.order_id,
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

  // 4) only commit to DB on success/settlement (or capture)
  if (status !== 'COMPLETED') {
    // Persist a Payment record (optional), but don’t create registration yet
    return prisma.payment.create({
      data: {
        orderId: payload.order_id,
        email: cache.email,
        amount: cache.amount,
        currency: 'IDR',
        status,
        rawPayload: payload as any
      }
    });
  }

  // 5) commit Registration + Payment atomically
  const result = await prisma.$transaction(async (tx) => {
    // Create or reuse registration (unique on [email, programId])
    const registration = await tx.programRegistration.upsert({
      where: { email_programId: { email: cache.email, programId: cache.programId } },
      update: {}, // if exists, we won't change detail on webhook
      create: {
        programId: cache.programId,
        memberId: cache.memberId,
        userId: cache.userId ?? undefined,
        email: cache.email,
        name: cache.name,
        phone: cache.phone ?? undefined,
        institution: cache.institution ?? undefined,
        segment: cache.segment ?? undefined,
        programPackage: cache.programPackage ?? undefined,
        source: cache.source === 'ADMIN' ? 'MEMBER' : (cache.source as any) // or keep as is
      }
    });

    const payment = await tx.payment.create({
      data: {
        orderId: payload.order_id,
        email: cache.email,
        amount: cache.amount,
        currency: 'IDR',
        method: cache.method as any,
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

  // 6) cleanup cache
  await redis.del(`pay:${payload.order_id}`);

  return result;
}
