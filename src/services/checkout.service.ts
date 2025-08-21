// src/services/checkout.service.ts
import redis from '../config/redis';
import { PrismaClient, PaymentMethod, Segment } from '@prisma/client';
import { genOrderId } from '../utils/orderId';
import { computePrice } from './pricing.service';
import { createTransactionQris } from './midtrans.service';

const prisma = new PrismaClient();

type CheckoutInput = {
  programId: string;
  email: string;
  name: string;
  phone?: string | null;
  institution?: string | null;
  segment?: Segment | null; // Segment | null
  programPackage?: string | null;
  method?: PaymentMethod; // default QRIS
  userId?: number | null;
};

export async function startCheckout(input: CheckoutInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1) compute price & member source
  const { amount, source, memberId } = await computePrice({
    programId: input.programId,
    email: normalizedEmail,
    programPackage: input.programPackage
  });

  // 2) create orderId
  const orderId = genOrderId('PRG');

  // 3) call midtrans
  const midtransRes = await createTransactionQris({
    orderId,
    amount,
    customerEmail: normalizedEmail,
    customerName: input.name,
    customerPhone: input.phone ?? undefined
  });

  // 4) store to Redis (TTL 2h)
  const cache = {
    programId: input.programId,
    email: normalizedEmail,
    name: input.name,
    phone: input.phone ?? null,
    institution: input.institution ?? null,
    segment: input.segment ?? null,
    programPackage: input.programPackage ?? null,
    userId: input.userId ?? null,
    memberId, // from computePrice if any
    source, // MEMBER | NON_MEMBER
    amount,
    currency: 'IDR',
    method: input.method ?? 'QRIS'
  };

  await redis.set(`pay:${orderId}`, JSON.stringify(cache), {
    EX: 60 * 60 * 2
  });

  return {
    orderId,
    amount,
    currency: 'IDR',
    midtrans: midtransRes // FE can render QR/token from here
  };
}
