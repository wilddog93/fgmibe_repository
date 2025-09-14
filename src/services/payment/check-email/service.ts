import { User, Member, PrismaClient } from '@prisma/client';

type QueryFilter = {
  email?: string;
  programId?: string;
};

type CheckEmailResult =
  | { type: 'user'; result: User[] | any }
  | { type: 'member'; result: Member[] | any }
  | { type: 'unregistered'; result: any };

const prisma = new PrismaClient();

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
  checkEmailRegistrationProgram,
  checkEmailRegistrationMember
};
