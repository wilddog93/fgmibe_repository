import { Prisma, Program, ProgramCategory, ProgramStatus } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../../client';
import ApiError from '../../utils/ApiError';

/**
 * Create a program
 * @param {Object} programBody
 * @returns {Promise<Program>}
 */
const createProgram = async (
  name: string,
  description: string,
  startDate: Date,
  endDate: Date,
  priceMember: number,
  priceNonMember: number,
  category: ProgramCategory
): Promise<Program> => {
  return prisma.program.create({
    data: {
      name,
      description,
      startDate,
      endDate,
      priceMember,
      priceNonMember,
      category,
      status: ProgramStatus.ACTIVE
    }
  });
};

/**
 * Query for programs
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

export interface ProgramTypeFilter {
  id?: string;
  name?: string;
  description?: string;
  category?: ProgramCategory;
  startDate?: Date | string;
  endDate?: Date | string;
  priceMember?: number;
  priceNonMember?: number;
  status?: ProgramStatus;
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

const queryPrograms = async <Key extends keyof Program>(
  filter: ProgramTypeFilter,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'name',
    'description',
    'startDate',
    'endDate',
    'priceMember',
    'priceNonMember',
    'category',
    'status',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<QueryResult> => {
  const page = Math.max(Number(options.page) || 1, 1); // default 1
  const limit = Math.max(Number(options.limit) || 10, 1); // default 10
  const sortBy = options.sortBy ?? 'createdAt';
  const sortType = options.sortType ?? 'desc';

  // field selector
  const selected = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});
  const query: Prisma.ProgramWhereInput = {
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
    startDate: {
      gte: filter?.startDate
    },
    endDate: {
      lte: filter?.endDate
    },
    priceMember: {
      gte: filter?.priceMember
    },
    priceNonMember: {
      gte: filter?.priceNonMember
    },
    category: {
      equals: filter?.category
    },
    status: {
      equals: filter?.status
    }
  };

  // count total
  const totalItems = await prisma.program.count({ where: query });

  // data
  const programs = await prisma.program.findMany({
    where: query,
    select: selected,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortType }
  });

  return {
    data: programs as Pick<Program, Key>[],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  };
};

/**
 * Get program by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Program, Key> | null>}
 */
const getProgramById = async <Key extends keyof Program>(
  id: string,
  keys: Key[] = [
    'id',
    'name',
    'description',
    'startDate',
    'endDate',
    'priceMember',
    'priceNonMember',
    'category',
    'status',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Program, Key> | null> => {
  return prisma.program.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Program, Key> | null>;
};

/**
 * Update program by id
 * @param {ObjectId} programId
 * @param {Object} updateBody
 * @returns {Promise<Program>}
 * @example
 * // Update program
 * const program = await prisma.program.update({
 *   where: { id: 'program-1' },
 *   data: {
 *     name: 'New Program Name'
 *   }
 * })
 */
const updateProgramById = async <Key extends keyof Program>(
  programId: string,
  updateBody: Prisma.ProgramUpdateInput,
  keys: Key[] = [
    'id',
    'name',
    'description',
    'startDate',
    'endDate',
    'priceMember',
    'priceNonMember',
    'category',
    'status'
  ] as Key[]
): Promise<Pick<Program, Key> | null> => {
  const program = await getProgramById(programId, [
    'id',
    'name',
    'description',
    'startDate',
    'endDate',
    'priceMember',
    'priceNonMember',
    'category',
    'status'
  ]);
  if (!program) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Program not found');
  }
  const updatedProgram = await prisma.program.update({
    where: { id: program.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  });
  return updatedProgram as Pick<Program, Key> | null;
};

/**
 * Delete program by id
 * @param {ObjectId} programId
 * @returns {Promise<Program>}
 */

const deleteProgramById = async (programId: string): Promise<Program> => {
  const program = await getProgramById(programId);
  if (!program) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Program not found');
  }
  await prisma.program.delete({ where: { id: program.id } });
  return program;
};

export default {
  createProgram,
  queryPrograms,
  getProgramById,
  updateProgramById,
  deleteProgramById
};
