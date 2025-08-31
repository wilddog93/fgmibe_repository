import {
  Member,
  Prisma,
  Program,
  ProgramRegistration,
  RegistrationSource,
  Segment
} from '@prisma/client';
import prisma from '../client';

export interface ProgramRegistrationParams {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  segment?: Segment | null;
  institution?: string | null;
  registeredAt?: Date;
  source?: RegistrationSource;

  program: Program;
  member?: Member;
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

/**
 * Query for program registrations
 * @param {Object} filter - Prisma filter
 * @returns {Promise<QueryResult>} - A promise that resolves to the query result
 */

const queryProgramRegistrations = async <Key extends keyof ProgramRegistration>(
  filter: ProgramRegistrationParams,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'email',
    'phone',
    'segment',
    'institution',
    'registeredAt',
    'source',
    'program',
    'member'
  ] as Key[]
): Promise<QueryResult> => {
  const page = Math.max(Number(options.page) || 1, 1); // default 1
  const limit = Math.max(Number(options.limit) || 10, 1); // default 10
  const sortBy = options.sortBy ?? 'registeredAt';
  const sortType = options.sortType ?? 'desc';

  // field selector
  const selected = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});
  const query: Prisma.ProgramRegistrationWhereInput = {
    id: {
      equals: filter?.id
    },
    email: {
      contains: filter?.email?.toLowerCase(),
      mode: 'insensitive'
    },
    name: {
      contains: filter?.name?.toLowerCase(),
      mode: 'insensitive'
    },
    segment: {
      equals: filter?.segment
    },
    institution: {
      contains: filter?.institution?.toLowerCase(),
      mode: 'insensitive'
    },
    registeredAt: {
      gte: filter?.registeredAt
    },
    source: {
      equals: filter?.source
    },
    program: {
      name: {
        contains: filter?.program?.name?.toLowerCase(),
        mode: 'insensitive'
      }
    },
    member: {
      name: {
        contains: filter?.member?.name.toLowerCase(),
        mode: 'insensitive'
      },
      email: {
        contains: filter?.member?.email.toLowerCase(),
        mode: 'insensitive'
      }
    }
  };

  const [data, totalItems] = await prisma.$transaction([
    prisma.programRegistration.findMany({
      where: query,
      // include: {
      //   member: true,
      //   program: true
      // },
      select: selected,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortType }
    }),
    prisma.programRegistration.count({ where: query })
  ]);

  return {
    data: data as Pick<ProgramRegistration, Key>[],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  };
};

export default {
  queryProgramRegistrations
};
