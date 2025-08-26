import { User, Prisma, Member, ProgramRegistration } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

interface EmailRegistration {
  type: string;
  data: ProgramRegistration | User | Member;
}

/**
 * Check email registration from User/Member/Program Registration email
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<EmailRegistration>}
 * @example
 * // Check email registration from User/Member/Program Registration email
 * const registration = await prisma.programRegistration.find({
 *   where: { email: 'fake@example.com' }
 * })
 * if (registration) {
 *   throw new ApiError(httpStatus.402, 'Your email has been registered!');
 * }
 *
 * const user = await prisma.user.findUnique({
 *   where: { email: 'fake@example.com' }
 * })
 * if (user) {
 *   return user;
 * }
 * const member = await prisma.member.findUnique({
 *   where: { email: 'fake@example.com' }
 * })
 * if (member) {
 *   return member;
 * }
 */

export const checkEmailRegistration = async (email: string): Promise<EmailRegistration> => {
  // Cek di ProgramRegistration
  const registration = await prisma.programRegistration.findMany({
    where: { email }
  });

  if (registration) {
    return { type: 'ProgramRegistration', data: registration };
  }

  // Cek di User
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    return { type: 'User', data: user };
  }

  // Cek di Member
  const member = await prisma.member.findUnique({
    where: { email }
  });

  if (member) {
    return { type: 'Member', data: member };
  }

  return null;
};

export default {
  checkEmailRegistration
};
