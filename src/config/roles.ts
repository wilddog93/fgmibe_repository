import { Role } from '@prisma/client';

const allRoles = {
  [Role.USER]: ['getUsers', 'getAuthors', 'getPosts'],
  [Role.ADMIN]: [
    'getUsers',
    'manageUsers',
    'getPosts',
    'managePosts',
    'getAuthors',
    'manageAuthors'
  ]
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
