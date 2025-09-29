import { Member, MemberStatus, Prisma, Segment } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../client';
import ApiError from '../../utils/ApiError';
import bcrypt from 'bcryptjs';

export interface QueryMemberFilter {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  segment?: Segment;
  interestAreas?: string[];
  joinDate?: Date | string;
  status?: MemberStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

type CacheMembership = {
  name: string;
  email: string;
  phone: string | null;
  institution: string | null;
  degree: string | null;
  studentId: string | null;
  segment: Segment | null;
  interestAreas: string[];
  userId: number | null;
  membershipPackageId?: string; // nama yang benar sesuai schema
  defaultPassword?: string; // opsional; kalau kosong pakai default
};

type QueryResult = {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

/**
 * Create member x user
 * @param {Object} memberBody
 * @returns {Promise<Member>}
 */
export const createMemberAndUser = async (tx: Prisma.TransactionClient, cache: CacheMembership) => {
  const email = cache.email.trim().toLowerCase();
  const seg: Segment = (cache.segment as Segment) ?? 'BASIC';
  const membershipPackageId = cache.membershipPackageId; // map alias → field schema

  if (!membershipPackageId) {
    throw new Error('membershipPackageId is required to create Member');
  }

  // 1) User: find or create, lalu pastikan role MEMBER
  let user = await tx.user.findUnique({ where: { email } });

  if (!user) {
    const hashed = await bcrypt.hash(cache.defaultPassword ?? 'Password123!', 10);
    user = await tx.user.create({
      data: {
        email,
        name: cache.name,
        phone: cache.phone ?? undefined,
        password: hashed,
        role: 'MEMBER',
        isEmailVerified: true
      }
    });
  } else if (user.role !== 'MEMBER') {
    user = await tx.user.update({
      where: { id: user.id },
      data: { role: 'MEMBER' }
    });
  }

  // 2) Member: upsert by unique email (idempotent)
  const existingMember = await tx.member.findUnique({ where: { email } });

  let member;
  if (!existingMember) {
    member = await tx.member.create({
      data: {
        name: cache.name,
        email,
        phone: cache.phone ?? undefined,
        institution: cache.institution ?? undefined,
        degree: cache.degree ?? undefined,
        studentId: cache.studentId ?? undefined,
        segment: seg,
        interestAreas: cache.interestAreas ?? [],
        membershipPackageId,
        status: 'ACTIVE',
        userId: user.id
      }
    });
  } else {
    // merge interestAreas unik
    const mergedAreas = Array.from(
      new Set([...(existingMember.interestAreas ?? []), ...(cache.interestAreas ?? [])])
    );

    member = await tx.member.update({
      where: { id: existingMember.id },
      data: {
        status: 'ACTIVE',
        userId: existingMember.userId ?? user.id,
        // update paket kalau berubah
        membershipPackageId,
        // optional sync ringan
        phone: existingMember.phone ?? cache.phone ?? undefined,
        institution: existingMember.institution ?? cache.institution ?? undefined,
        // segment wajib ada di schema; jangan overwrite kalau sudah ada
        segment: existingMember.segment ?? seg,
        interestAreas: mergedAreas
      }
    });
  }

  return { user, member };
};

/**
 * Create a member
 * @param {Object} memberBody
 * @returns {Promise<Member>}
 */
const createMember = async (
  name: string,
  email: string,
  phone: string | null,
  institution: string | null,
  segment: Segment,
  interestAreas: string[],
  joinDate: Date,
  status: MemberStatus,
  userId: number | null,
  membershipPackageId: string
): Promise<Member> => {
  const existingMember = await getMemberByEmail(email);
  if (existingMember) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  return prisma.member.create({
    data: {
      name,
      email,
      phone,
      institution,
      segment,
      interestAreas,
      joinDate,
      status,
      userId,
      membershipPackageId
    }
  });
};

/**
 * Get member by email
 * @param {string} email
 * @returns {Promise<Member>}
 */
const getMemberByEmail = async <Key extends keyof Member>(
  email: string,
  keys: Key[] = ['email'] as Key[]
): Promise<Pick<Member, Key> | null> => {
  return prisma.member.findUnique({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Member, Key> | null>;
};

/**
 * Get member by id
 * @param {string} id
 * @returns {Promise<Member>}
 */
const getMemberById = async <Key extends keyof Member>(
  id: string,
  keys: Key[] = [
    'id',
    'name',
    'email',
    'phone',
    'institution',
    'segment',
    'interestAreas',
    'joinDate',
    'status'
  ] as Key[]
): Promise<Pick<Member, Key> | null> => {
  return prisma.member.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Member, Key> | null>;
};

/**
 * Update member by id
 * @param {string} memberId
 * @param {Object} updateBody
 * @returns {Promise<Member>}
 * @example
 * // Update member
 * const member = await prisma.member.update({
 *   where: { id: 'member-1' },
 *   data: {
 *     name: 'New Member Name'
 *   }
 * })
 */
const updateMemberById = async <Key extends keyof Member>(
  memberId: string,
  updateBody: Prisma.MemberUpdateInput,
  keys: Key[] = [
    'id',
    'name',
    'email',
    'phone',
    'institution',
    'segment',
    'interestAreas',
    'joinDate',
    'status'
  ] as Key[]
): Promise<Pick<Member, Key> | null> => {
  const member = await getMemberById(memberId, [
    'id',
    'name',
    'email',
    'phone',
    'institution',
    'segment',
    'interestAreas',
    'joinDate',
    'status'
  ]);
  if (!member) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Member not found');
  }
  if (updateBody.email && (await getMemberByEmail(updateBody.email as string))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const updatedMember = await prisma.member.update({
    where: { id: member.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedMember as Pick<Member, Key> | null;
};

/**
 * Delete member by id
 * @param {string} memberId
 * @returns {Promise<Member>}
 */
const deleteMemberById = async (memberId: string): Promise<Member> => {
  const member = await getMemberById(memberId);
  if (!member) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Member not found');
  }
  await prisma.member.delete({ where: { id: member.id } });
  return member;
};

/**
 * Get members by filter
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryMembers = async <Key extends keyof Member>(
  filter: QueryMemberFilter,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'name',
    'email',
    'phone',
    'institution',
    'segment',
    'interestAreas',
    'joinDate',
    'status',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<QueryResult> => {
  const page = Math.max(Number(options.page) || 1, 1); // default 1
  const limit = Math.max(Number(options.limit) || 10, 1); // default 10
  const sortBy = options.sortBy ?? 'createdAt';
  const sortType = options.sortType ?? 'desc';
  const selected = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});
  // const query: Prisma.MemberWhereInput = {
  //   id: {
  //     equals: filter?.id
  //   },
  //   name: {
  //     contains: filter?.name?.toLowerCase(),
  //     mode: 'insensitive'
  //   },
  //   email: {
  //     contains: filter?.email?.toLowerCase(),
  //     mode: 'insensitive'
  //   },
  //   phone: {
  //     contains: filter?.phone?.toLowerCase(),
  //     mode: 'insensitive'
  //   },
  //   institution: {
  //     contains: filter?.institution?.toLowerCase(),
  //     mode: 'insensitive'
  //   },
  //   segment: {
  //     equals: filter?.segment
  //   },
  //   interestAreas: {
  //     equals: filter?.interestAreas,
  //     isEmpty: filter?.interestAreas?.length === 0
  //   },
  //   joinDate: {
  //     gte: filter?.joinDate
  //   },
  //   status: {
  //     equals: filter?.status
  //   }
  // };
  // count total

  console.log(filter, 'filter-member');
  const query: Prisma.MemberWhereInput = {
    ...(filter?.id && { id: { equals: filter.id } }),
    ...(filter?.name && {
      name: { contains: filter.name.toLowerCase(), mode: 'insensitive' }
    }),
    ...(filter?.email && {
      email: { contains: filter.email.toLowerCase(), mode: 'insensitive' }
    }),
    ...(filter?.phone && {
      phone: { contains: filter.phone.toLowerCase(), mode: 'insensitive' }
    }),
    ...(filter?.institution && {
      institution: {
        contains: filter.institution.toLowerCase(),
        mode: 'insensitive'
      }
    }),
    ...(filter?.segment && { segment: { equals: filter.segment } }),

    // ✅ FIX: filter interestAreas
    ...(filter?.interestAreas?.length ? { interestAreas: { hasSome: filter.interestAreas } } : {}),

    ...(filter?.joinDate && { joinDate: { gte: filter.joinDate } }),
    ...(filter?.status && { status: { equals: filter.status } })
  };

  const totalItems = await prisma.member.count({ where: query });
  // data
  const members = await prisma.member.findMany({
    where: query,
    select: selected,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortType }
  });
  return {
    data: members as Pick<Member, Key>[],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  };
};

export default {
  createMemberAndUser,
  createMember,
  queryMembers,
  getMemberById,
  updateMemberById,
  deleteMemberById
};
