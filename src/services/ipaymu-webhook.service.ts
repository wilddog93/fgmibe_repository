// src/services/ipaymu-webhook.service.ts
import { PrismaClient, PaymentStatus, Segment, PaymentMethod } from '@prisma/client';
import redis from '../config/redis';
import logger from '../config/logger';
import { createMemberAndUser } from './member.service';

const prisma = new PrismaClient();

// Type dari Ipaymu Notification
type IpaymuNotif = {
  trx_id: string;
  status: string;
  status_code: string;
  sid: string;
  reference_id: string;
  amount: string;
  via: string;
};

// Map status Ipaymu → PaymentStatus Prisma
function mapIpaymuToPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case 'berhasil':
    case 'sukses':
    case 'success':
    case 'completed':
      return 'COMPLETED';
    case 'pending':
      return 'PENDING';
    case 'gagal':
    case 'failed':
    case 'cancel':
    case 'expired':
      return 'FAILED';
    default:
      return 'FAILED';
  }
}

// === HANDLE PROGRAM REGISTRATION ===
const handleProgramRegistrationIpaymu = async (
  orderId: string,
  status: PaymentStatus,
  payload: IpaymuNotif,
  cache: {
    programId: string;
    email: string;
    name: string;
    phone: string | null;
    institution: string | null;
    segment: Segment | null;
    userId: number | null;
    memberId: string | null;
    source: 'MEMBER' | 'NON_MEMBER' | 'ADMIN';
    amount: number;
    currency: 'IDR';
    method: 'BANK_TRANSFER' | 'VA' | 'QRIS' | 'EWALLET';
  }
) => {
  // 1) Idempotency check
  const existing = await prisma.payment.findUnique({ where: { orderId } });

  if (existing) {
    // Jika status berubah → update payment
    if (existing.status !== status) {
      const updated = await prisma.payment.update({
        where: { orderId },
        data: {
          status,
          rawPayload: payload as any,
          gatewayTransactionId: payload.trx_id,
          paidAt: status === 'COMPLETED' ? new Date() : existing.paidAt,
          method: payload?.via?.toUpperCase() as PaymentMethod
        }
      });

      logger.info(`[IPAYMU] Payment updated for orderId=${orderId} → status=${status}`);

      // Kalau baru COMPLETED → buat registrasi
      if (status === 'COMPLETED' && !updated.registrationId && cache) {
        const registration = await prisma.programRegistration.upsert({
          where: {
            email_programId: { email: cache.email, programId: cache.programId }
          },
          update: {},
          create: {
            programId: cache.programId,
            memberId: cache.memberId ?? null,
            userId: cache.userId ?? null,
            email: cache.email,
            name: cache.name,
            phone: cache.phone ?? undefined,
            institution: cache.institution ?? undefined,
            segment: cache.segment ?? null,
            source: cache.source
          }
        });

        await prisma.payment.update({
          where: { orderId },
          data: { registrationId: registration.id }
        });

        await redis.del(`pay:${orderId}`);
        logger.info(`[IPAYMU] Registration created & linked for orderId=${orderId}`);
      }
    }

    return existing;
  }

  // 2) Jika payment belum ada & belum COMPLETED → simpan sementara
  if (status !== 'COMPLETED') {
    return prisma.payment.create({
      data: {
        orderId,
        email: cache.email,
        amount: cache.amount,
        currency: cache.currency,
        status,
        method: cache.method
          ? cache.method
          : (payload?.via?.toUpperCase() as PaymentMethod) || 'QRIS',
        rawPayload: payload as any,
        gatewayTransactionId: payload.trx_id
      }
    });
  }

  // 3) Jika COMPLETED pertama kali → create payment + registrasi atomic
  const result = await prisma.$transaction(async (tx) => {
    const registration = await tx.programRegistration.upsert({
      where: { email_programId: { email: cache.email, programId: cache.programId } },
      update: {},
      create: {
        programId: cache.programId,
        memberId: cache.memberId ?? null,
        userId: cache.userId ?? null,
        email: cache.email,
        name: cache.name,
        phone: cache.phone ?? undefined,
        institution: cache.institution ?? undefined,
        segment: cache.segment ?? null,
        source: cache.source
      }
    });

    const payment = await tx.payment.create({
      data: {
        orderId,
        email: cache.email,
        amount: cache.amount,
        currency: cache.currency,
        method: cache.method,
        gateway: 'IPAYMU',
        status,
        rawPayload: payload as any,
        paidAt: new Date(),
        registrationId: registration.id,
        memberId: cache.memberId ?? undefined
      }
    });

    return { registration, payment };
  });

  await redis.del(`pay:${orderId}`);
  logger.info(`[IPAYMU] Payment & Registration committed for orderId=${orderId}`);

  return result;
};

// === HANDLE MEMBERSHIP REGISTRATION ===
const handleMembershipRegistrationIpaymu = async (
  orderId: string,
  status: PaymentStatus,
  payload: IpaymuNotif,
  cache: {
    name: string;
    email: string;
    phone: string | null;
    institution: string | null;
    segment: Segment;
    interestAreas: string[];
    membershipPackageId: string;
    userId: number | null;
    amount: number;
    currency: 'IDR';
    method: 'BANK_TRANSFER' | 'VA' | 'QRIS' | 'EWALLET';
  }
) => {
  const existing = await prisma.payment.findUnique({ where: { orderId } });

  if (existing) {
    if (existing.status !== status) {
      const updated = await prisma.payment.update({
        where: { orderId },
        data: {
          status,
          rawPayload: payload as any,
          gatewayTransactionId: payload.trx_id,
          paidAt: status === 'COMPLETED' ? new Date() : existing.paidAt,
          method: payload?.via?.toUpperCase() as PaymentMethod
        }
      });

      logger.info(`[IPAYMU] Membership payment updated orderId=${orderId}`);

      if (status === 'COMPLETED' && !updated.memberId && cache) {
        const result = await prisma.$transaction(async (tx) => {
          const { member } = await createMemberAndUser(tx, cache);

          const linked = await tx.payment.update({
            where: { orderId },
            data: { memberId: member.id }
          });

          return { member, payment: linked };
        });

        await redis.del(`pay:${orderId}`);
        return result.payment;
      }
    }
    return existing;
  }

  // Belum ada payment sebelumnya
  if (status !== 'COMPLETED') {
    return prisma.payment.create({
      data: {
        orderId,
        email: cache.email,
        amount: cache.amount,
        currency: cache.currency,
        status,
        rawPayload: payload as any,
        gatewayTransactionId: payload.trx_id,
        method: cache.method
          ? cache.method
          : (payload?.via?.toUpperCase() as PaymentMethod) || 'QRIS'
      }
    });
  }

  // COMPLETED pertama kali → create Member + Payment atomic
  const result = await prisma.$transaction(async (tx) => {
    const { member, user } = await createMemberAndUser(tx, cache);

    const payment = await tx.payment.create({
      data: {
        orderId,
        email: cache.email,
        amount: cache.amount,
        currency: cache.currency,
        method: cache.method
          ? cache.method
          : (payload?.via?.toUpperCase() as PaymentMethod) || 'QRIS',
        gateway: 'IPAYMU',
        status,
        rawPayload: payload as any,
        paidAt: new Date(),
        memberId: member.id
      }
    });

    return { member, user, payment };
  });

  await redis.del(`pay:${orderId}`);
  logger.info(`[IPAYMU] Membership created & linked for orderId=${orderId}`);
  return result;
};

// === WEBHOOK HANDLER ===
const handleIpaymuWebhook = async (payload: IpaymuNotif) => {
  const orderId = payload.reference_id;
  const status = mapIpaymuToPaymentStatus(payload.status);

  logger.info(`[IPAYMU] Webhook received: orderId=${orderId}, status=${status}`);

  const cacheRaw = await redis.get(`pay:${orderId}`);
  if (!cacheRaw) {
    logger.warn(`[IPAYMU] Cache missing for orderId=${orderId}`);
    return prisma.payment.create({
      data: {
        orderId,
        email: '',
        amount: Math.floor(parseFloat(payload.amount) || 0),
        currency: 'IDR',
        status,
        rawPayload: payload as any
      }
    });
  }

  const cache = JSON.parse(cacheRaw);
  if (cache.programId) {
    return handleProgramRegistrationIpaymu(orderId, status, payload, cache);
  } else if (cache.membershipPackageId) {
    return handleMembershipRegistrationIpaymu(orderId, status, payload, cache);
  }
};

export default {
  handleIpaymuWebhook
};
