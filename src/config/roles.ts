import { Role } from '@prisma/client';

const allRoles = {
  [Role.USER]: ['getUser', 'getAuthors', 'getPosts'],
  [Role.ADMIN]: ['getUsers', 'manageUsers', 'managePosts', 'manageAuthors', 'getAuthors']
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
