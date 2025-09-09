// src/services/checkout-ipaymu.service.ts
import { MemberStatus, Payment, PaymentMethod, PrismaClient } from '@prisma/client';
import redis from '../config/redis';
import { genOrderId } from '../utils/orderId';
import { createIpaymuCheckout } from './ipaymu.service';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { computePriceMember, computePriceProgram } from './pricing.service';
import logger from '../config/logger';

const prisma = new PrismaClient();

interface CheckoutInputProgram {
  programId: string;
  email: string;
  name: string;
  phone?: string;
  institution?: string;
  segment?: string;
  userId?: number;
  method?: PaymentMethod; // default QRIS
}

interface CheckoutMemberInput {
  membershipPackageId: string;
  email: string;
  name: string;
  phone?: string;
  institution?: string;
  segment?: string;
  studentId?: string;
  degree?: string;
  interestAreas?: string[];
  joinDate?: Date;
  status?: MemberStatus;
  method?: PaymentMethod; // default QRIS
  userId?: number;
}

interface CheckoutResult {
  orderId: string;
  amount: number;
  currency: string;
  ipaymu: any;
}

export const checkoutProgramIpaymu = async (
  input: CheckoutInputProgram
): Promise<CheckoutResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1️⃣ Cek apakah email sudah daftar untuk program ini
  const isRegistered = await prisma.programRegistration.findUnique({
    where: {
      email_programId: {
        email: normalizedEmail,
        programId: input.programId
      }
    },
    select: {
      email: true,
      programId: true,
      program: true
    }
  });

  if (isRegistered) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Email already registered in ${isRegistered.program.name}`
    );
  }

  // 2️⃣ Hitung harga & membership source
  const { amount, source, memberId, programs } = await computePriceProgram({
    programId: input.programId,
    email: normalizedEmail
  });

  // 3️⃣ Generate orderId
  const orderId = genOrderId('PRG');

  // 4️⃣ Build body untuk Ipaymu
  const ipaymuBody = {
    product: [programs?.name ?? 'Program'],
    qty: ['1'],
    price: [amount ? amount.toString() : '0'],
    description: ['Program Registration'],
    returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
    notifyUrl: `${process.env.API_URL}/v1/payment/ipaymu/webhook`,
    cancelUrl: `${process.env.FRONTEND_URL}/payment/failed`,
    referenceId: orderId,
    buyerName: input.name,
    buyerEmail: normalizedEmail,
    buyerPhone: input.phone ?? ''
  };

  // 5️⃣ Call Ipaymu API
  const ipaymuRes = await createIpaymuCheckout(ipaymuBody);
  logger.info(`[IPAYMU] Payment response program packages ${ipaymuRes}`);

  // 6️⃣ Simpan ke Redis (TTL 2h) → sama seperti Snap
  const cache = {
    programId: input.programId,
    email: normalizedEmail,
    name: input.name,
    phone: input.phone ?? null,
    institution: input.institution ?? null,
    segment: input.segment ?? null,
    userId: input.userId ?? null,
    memberId,
    source,
    amount,
    currency: 'IDR',
    method: input.method ?? ''
  };

  await redis.set(`pay:${orderId}`, JSON.stringify(cache), {
    EX: 60 * 60 * 2
  });

  return {
    orderId,
    amount: amount as number,
    currency: 'IDR',
    ipaymu: ipaymuRes?.Data // FE bisa ambil redirectUrl di sini
  };
};

export const checkoutRegisterMemberIpaymu = async (
  input: CheckoutMemberInput
): Promise<CheckoutResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();
  // check email member
  const isMember = await prisma.member.findUnique({
    where: {
      email: normalizedEmail
    },
    select: {
      email: true,
      name: true,
      phone: true,
      institution: true,
      segment: true,
      joinDate: true,
      status: true
    }
  });

  if (isMember) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Email already registered in ${isMember.name}`);
  }

  // 2️⃣ Hitung harga & membership source
  const { amount, id, name } = await computePriceMember({
    membershipPackageId: input.membershipPackageId
  });

  // 3️⃣ Generate orderId
  const orderId = genOrderId('MEM');

  // 4️⃣ Build body untuk Ipaymu
  const ipaymuBody = {
    product: [name ?? 'Member'],
    qty: ['1'],
    price: [amount ? amount.toString() : '0'],
    description: ['Member Registration'],
    returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
    notifyUrl: `${process.env.API_URL}/v1/payment/ipaymu/webhook`,
    cancelUrl: `${process.env.FRONTEND_URL}/payment/failed`,
    referenceId: orderId,
    buyerName: input.name,
    buyerEmail: normalizedEmail,
    buyerPhone: input.phone ?? ''
  };

  // 5️⃣ Call Ipaymu API
  const ipaymuRes = await createIpaymuCheckout(ipaymuBody);
  logger.info(`[IPAYMU] Payment response membership packages ${ipaymuRes}`);

  // 6️⃣ Simpan ke Redis (TTL 2h) → sama seperti Snap
  const cache = {
    membershipPackageId: input.membershipPackageId,
    email: normalizedEmail,
    name: input.name,
    phone: input.phone ?? null,
    institution: input.institution ?? null,
    segment: input.segment ?? null,
    studentId: input.studentId ?? null,
    degree: input.degree ?? null,
    interestAreas: input.interestAreas ?? [],
    userId: input.userId ?? null,
    amount,
    currency: 'IDR',
    method: input.method ?? ''
  };

  await redis.set(`pay:${orderId}`, JSON.stringify(cache), {
    EX: 60 * 60 * 2
  });

  return {
    orderId,
    amount: amount ?? 0,
    currency: 'IDR',
    ipaymu: ipaymuRes?.Data // FE bisa ambil redirectUrl di sini
  };
};

export default {
  checkoutProgramIpaymu,
  checkoutRegisterMemberIpaymu
};
