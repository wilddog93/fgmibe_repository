// src/services/checkout.service.ts
import redis from '../config/redis';
import {
  PrismaClient,
  PaymentMethod,
  Segment,
  ProgramRegistration,
  User,
  Member,
  MemberStatus
} from '@prisma/client';
import { genOrderId } from '../utils/orderId';
import { computePriceMember, computePriceProgram } from './pricing.service';
import { createTransactionCharge, createTransactionSnap } from './midtrans.service';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

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
  memberId?: string | null;
};

type CheckoutMemberInput = {
  membershipPackageId: string;
  email: string;
  name: string;
  phone?: string | null;
  institution?: string | null;
  segment?: Segment | null; // Segment | null
  studentId?: string | null;
  degree?: string | null;
  interestAreas?: string[];
  joinDate?: Date | string;
  status?: MemberStatus;
  method?: PaymentMethod; // default QRIS
  userId?: number | null;
};

type QueryFilter = {
  email?: string;
  programId?: string;
};

type CheckEmailResult =
  | { type: 'user'; result: User[] | any }
  | { type: 'member'; result: Member[] | any }
  | { type: 'unregistered'; result: any };

/**
 * Create a program
 * @param {CheckoutInput} programBody
 * @returns {Promise<CheckoutResult>}
 */
const checkoutProgramSnap = async (input: CheckoutInput): Promise<CheckoutResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // check email registration
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

  // 1) compute price & member source
  const { amount, source, memberId, programs } = await computePriceProgram({
    programId: input.programId,
    email: normalizedEmail
  });

  // 2) create orderId
  const orderId = genOrderId('PRG');

  // 3) body for snap
  const params = {
    orderId,
    amount: amount ?? 0,
    customerDetails: {
      email: normalizedEmail,
      first_name: input.name,
      phone: input.phone ?? undefined
    },
    itemDetails: [
      {
        id: input.programId,
        name: programs?.name,
        price: amount ?? 0,
        quantity: 1
      }
    ]
  };

  // 3) call midtrans
  const midtransRes = await createTransactionSnap(params);

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

const checkoutProgram = async (input: CheckoutInput): Promise<CheckoutResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // check email registration
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

  // 1) compute price & member source
  const { amount, source, memberId, programs } = await computePriceProgram({
    programId: input.programId,
    email: normalizedEmail
  });

  // 2) create orderId
  const orderId = genOrderId('PRG');

  // body for charge
  const params = {
    orderId,
    amount: amount ?? 0,
    customerDetails: {
      email: normalizedEmail,
      first_name: input.name,
      phone: input.phone ?? undefined
    },
    itemDetails: [
      {
        id: input.programId,
        name: programs?.name,
        price: amount ?? 0,
        quantity: 1
      }
    ]
  };

  // 3) call midtrans
  const midtransRes = await createTransactionCharge(params);

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

const checkoutRegisterMember = async (input: CheckoutMemberInput): Promise<CheckoutResult> => {
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
  // 1) compute price & member source
  const { id, name, amount } = await computePriceMember({
    membershipPackageId: input.membershipPackageId
  });
  // 2) create orderId
  const orderId = genOrderId('MEM');
  // body for charge
  const params = {
    orderId,
    amount: amount ?? 0,
    customerDetails: {
      email: normalizedEmail,
      first_name: input.name,
      phone: input.phone ?? undefined
    },
    itemDetails: [
      {
        id: id,
        name: name,
        price: amount ?? 0,
        quantity: 1
      }
    ]
  };
  // 3) call midtrans
  const midtransRes = await createTransactionCharge(params);
  // 4) store to Redis (TTL 2h)
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

const checkoutRegisterMemberSnap = async (input: CheckoutMemberInput): Promise<CheckoutResult> => {
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
  // 1) compute price & member source
  const { id, name, amount } = await computePriceMember({
    membershipPackageId: input.membershipPackageId
  });
  // 2) create orderId
  const orderId = genOrderId('MEM');
  // body for charge
  const params = {
    orderId,
    amount: amount ?? 0,
    customerDetails: {
      email: normalizedEmail,
      first_name: input.name,
      phone: input.phone ?? undefined
    },
    itemDetails: [
      {
        id: id,
        name: name,
        price: amount ?? 0,
        quantity: 1
      }
    ]
  };
  // 3) call midtrans
  const midtransRes = await createTransactionSnap(params);
  // 4) store to Redis (TTL 2h)
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

/**
 * Check email registration from User/Member/Program Registration email
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<CheckEmailResult>}
 */

export const checkEmailRegistrationProgram = async (
  filter: QueryFilter
): Promise<CheckEmailResult> => {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: filter.email?.toLowerCase(),
        mode: 'insensitive'
      }
    },
    select: {
      email: true,
      name: true,
      phone: true,
      member: true
    }
  });
  if (users.length) {
    return { type: 'user', result: users };
  }

  const members = await prisma.member.findMany({
    where: {
      email: {
        contains: filter.email?.toLowerCase(),
        mode: 'insensitive'
      }
    },
    select: {
      email: true,
      name: true,
      phone: true,
      segment: true,
      institution: true
    }
  });
  if (members.length) {
    return { type: 'member', result: members };
  }
  return { type: 'unregistered', result: [] };
};

export const checkEmailRegistrationMember = async (
  filter: QueryFilter
): Promise<CheckEmailResult> => {
  // get user by email where membershipPackage is null / undefined
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: filter.email?.toLowerCase(),
        mode: 'insensitive'
      },
      member: {
        is: null
      }
    }
  });
  if (users.length) {
    return { type: 'user', result: users };
  }
  return { type: 'unregistered', result: [] };
};

export default {
  checkoutProgram,
  checkoutProgramSnap,
  checkEmailRegistrationProgram,
  checkoutRegisterMember,
  checkoutRegisterMemberSnap,
  checkEmailRegistrationMember
};
