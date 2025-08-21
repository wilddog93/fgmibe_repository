// src/services/checkout.service.ts
import redis from '../config/redis';
import { PrismaClient, PaymentMethod, Segment } from '@prisma/client';
import { genOrderId } from '../utils/orderId';
import { computePriceProgram } from './pricing.service';
import { createTransactionQris } from './midtrans.service';

const prisma = new PrismaClient();

type CheckoutResult = {
  orderId: string;
  amount: number;
  currency: 'IDR';
  midtrans: any;
};

type CheckoutInput = {
  programId: string;
  email: string;
  name: string;
  phone?: string | null;
  institution?: string | null;
  segment?: Segment | null; // Segment | null
  method?: PaymentMethod; // default QRIS
  userId?: number | null;
};

/**
 * Create a program
 * @param {CheckoutInput} programBody
 * @returns {Promise<CheckoutResult>}
 */

const startCheckoutProgram = async (input: CheckoutInput): Promise<CheckoutResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1) compute price & member source
  const { amount, source, memberId } = await computePriceProgram({
    programId: input.programId,
    email: normalizedEmail
  });

  // 2) create orderId
  const orderId = genOrderId('PRG');

  // 3) call midtrans
  const midtransRes = await createTransactionQris({
    orderId,
    amount: amount ?? 0,
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
    amount: amount ?? 0,
    currency: 'IDR',
    midtrans: midtransRes // FE can render QR/token from here
  };
};

export { startCheckoutProgram };
