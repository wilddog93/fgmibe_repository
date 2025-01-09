import { Post, Prisma, Role, User } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

/**
 * Create posts only admin can create
 * @param {Post} post
 * @param {User} user
 * @returns {Promise<Post>}
 */
const createPost = async (post: Post, authorId: number): Promise<Post> => {
  // const user = await prisma.user.findUnique({
  //   where: { id: authorId }
  // });
  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Author not found');
  // }
  // if (user.role !== Role.ADMIN) {
  //   throw new ApiError(httpStatus.FORBIDDEN, 'Only admin can create post');
  // }
  const { id } = await prisma.post.create({
    data: {
      title: post.title,
      content: post.content,
      published: false,
      viewCount: 0,
      authorId: post.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  return prisma.post.findUnique({
    where: { id }
  }) as Promise<Post>;
};

/**
 * Query for Posts
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

export interface PostTypeFilter {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  title?: string;
  content?: string | null;
  published?: boolean;
  viewCount?: number;
  authorId?: number | null;
  author?: User;
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

const queryPosts = async <Key extends keyof Post>(
  filter: PostTypeFilter,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'title',
    'content',
    'authorId',
    'author',
    'viewCount',
    'published',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<QueryResult> => {
  const page = Number(options.page ?? 0);
  const limit = Number(options.limit ?? 100);
  const sortBy = options.sortBy ?? 'createdAt';
  const sortType = options.sortType ?? 'desc';
  const selected = keys.reduce((obj, k) => {
    return {
      ...obj,
      [k]: true,
      author: {
        select: {
          name: true,
          email: true
        }
      }
    };
  }, {});
  const query: Prisma.PostWhereInput = {
    title: {
      contains: filter?.title?.toLowerCase(),
      mode: 'insensitive'
    },
    content: {
      contains: filter?.content?.toLowerCase(),
      mode: 'insensitive'
    },
    authorId: {
      equals: filter?.authorId
    },
    author: {
      AND: [
        {
          name: {
            contains: filter?.author?.name?.toLowerCase(),
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: filter?.author?.email?.toLowerCase(),
            mode: 'insensitive'
          }
        }
      ]
    },
    viewCount: {
      gte: filter?.viewCount
    },
    published: {
      equals: filter?.published ?? true
    }
  };
  const totalItems = await prisma.post.count({
    where: query
  });
  const posts = await prisma.post.findMany({
    where: query,
    select: selected,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });

  const result = {
    data: posts as Pick<Post, Key>[],
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(Number(totalItems) / Number(limit))
    }
  };

  console.log({ filter, selected }, 'selected');
  return result;
};

/**
 * Get a Post by ID
 * @param {number} id
 * @returns {Promise<Post>}
 */
const getPostById = async <Key extends keyof Post>(
  id: number,
  keys: Key[] = [
    'id',
    'authorId',
    'title',
    'content',
    'viewCount',
    'published',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Post, Key> | null> => {
  return prisma.post.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Post, Key> | null>;
};

/**
 * Get a Post by Author ID
 * @param {number} authorId
 * @returns {Promise<Post[]>}
 */
const getPostsByAuthorId = async (authorId: number): Promise<Post[]> => {
  return prisma.post.findMany({
    where: { authorId }
  });
};

/**
 * Get all posts by author name
 * @param {string} authorName
 * @returns {Promise<Post[]>}
 */
const getPostsByAuthorName = async (authorName: string): Promise<Post[]> => {
  return prisma.post.findMany({
    where: { author: { name: authorName } }
  });
};

/**
 * Update post only admin can update
 * @param {number} id
 * @param {Post} post
 * @param {User} user
 * @returns {Promise<Post>}
 */
const updatePostById = async <Key extends keyof Post>(
  id: number,
  authorId: number,
  keys: Key[] = [
    'id',
    'title',
    'content',
    'authorId',
    'viewCount',
    'published',
    'createdAt',
    'updatedAt'
  ] as Key[],
  post: Prisma.PostUpdateInput
): Promise<Post> => {
  const author = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true }
  });
  const user = await prisma.user.findUnique({
    where: { id: authorId }
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Author not found');
  }
  if (!author) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (author.authorId !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only author can update post');
  }
  if (user.role !== Role.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admin can update post');
  }
  const { id: updatedId } = await prisma.post.update({
    where: { id },
    data: post
  });
  return prisma.post.findUnique({
    where: { id: updatedId }
  }) as Promise<Post>;
};

/**
 * Delete post only admin can delete
 * @param {number} id
 * @param {User} user
 * @returns {Promise<Post>}
 */
const deletePostById = async (id: number, user: User): Promise<Post> => {
  if (user.role !== Role.ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admin can delete post');
  }
  const { id: deletedId } = await prisma.post.delete({
    where: { id },
    select: { id: true }
  });
  return prisma.post.findUnique({
    where: { id: deletedId }
  }) as Promise<Post>;
};

export default {
  createPost,
  queryPosts,
  getPostById,
  getPostsByAuthorId,
  getPostsByAuthorName,
  updatePostById,
  deletePostById
};
