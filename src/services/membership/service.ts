import { MembershipPackage, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../client';
import ApiError from '../../utils/ApiError';

export interface MembershipPackageTypeFilter {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

type QueryResult = {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

// TODO: Create Membership Package
/**
 * Create a membership package
 * @param {Object} membershipPackageBody
 * @returns {Promise<MembershipPackage>}
 *
 */

const createMembershipPackage = async (
  name: string,
  description: string,
  price: number
): Promise<MembershipPackage> => {
  return prisma.membershipPackage.create({
    data: {
      name,
      description,
      price
    }
  });
};

/**
 * Query for membership packages
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const queryMembershipPackages = async <Key extends keyof MembershipPackage>(
  filter: MembershipPackageTypeFilter,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = ['id', 'name', 'description', 'price', 'createdAt', 'updatedAt'] as Key[]
): Promise<QueryResult> => {
  const page = Math.max(Number(options.page) || 1, 1); // default 1
  const limit = Math.max(Number(options.limit) || 10, 1); // default 10
  const sortBy = options.sortBy ?? 'createdAt';
  const sortType = options.sortType ?? 'desc';

  // field selector
  const selected = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});
  const query: Prisma.MembershipPackageWhereInput = {
    id: {
      equals: filter?.id
    },
    name: {
      contains: filter?.name?.toLowerCase(),
      mode: 'insensitive'
    },
    description: {
      contains: filter?.description?.toLowerCase(),
      mode: 'insensitive'
    },
    price: {
      gte: filter?.price
    }
  };

  // count total
  const totalItems = await prisma.membershipPackage.count({ where: query });

  // data
  const programs = await prisma.membershipPackage.findMany({
    where: query,
    select: selected,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortType }
  });

  return {
    data: programs as Pick<MembershipPackage, Key>[],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  };
};

/**
 * Get membership package by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<MembershipPackage, Key> | null>}
 */

const getMembershipPackageById = async <Key extends keyof MembershipPackage>(
  id: string,
  keys: Key[] = ['id', 'name', 'description', 'price', 'createdAt', 'updatedAt'] as Key[]
): Promise<Pick<MembershipPackage, Key> | null> => {
  return prisma.membershipPackage.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<MembershipPackage, Key> | null>;
};

/**
 * Update membership package by id
 * @param {ObjectId} membershipPackageId
 * @param {Object} updateBody
 * @returns {Promise<MembershipPackage>}
 * @example
 * // Update membership package
 * const membershipPackage = await prisma.membershipPackage.update({
 *   where: { id: 'membershipPackage-1' },
 *   data: {
 *     name: 'New Membership Package Name'
 *   }
 * })
 */
const updateMembershipPackageById = async <Key extends keyof MembershipPackage>(
  membershipPackageId: string,
  updateBody: Prisma.MembershipPackageUpdateInput,
  keys: Key[] = ['id', 'name', 'description', 'price', 'createdAt', 'updatedAt'] as Key[]
): Promise<Pick<MembershipPackage, Key> | null> => {
  const membershipPackage = await getMembershipPackageById(membershipPackageId, [
    'id',
    'name',
    'description',
    'price',
    'createdAt',
    'updatedAt'
  ]);
  if (!membershipPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Membership package not found');
  }
  const updatedMembershipPackage = await prisma.membershipPackage.update({
    where: { id: membershipPackage.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedMembershipPackage as Pick<MembershipPackage, Key> | null;
};

/**
 * Delete membership package by id
 * @param {ObjectId} membershipPackageId
 * @returns {Promise<MembershipPackage>}
 */

const deleteMembershipPackageById = async (
  membershipPackageId: string
): Promise<MembershipPackage> => {
  const membershipPackage = await getMembershipPackageById(membershipPackageId);
  if (!membershipPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Membership package not found');
  }
  await prisma.membershipPackage.delete({ where: { id: membershipPackage.id } });
  return membershipPackage;
};

export default {
  createMembershipPackage,
  queryMembershipPackages,
  getMembershipPackageById,
  updateMembershipPackageById,
  deleteMembershipPackageById
};
