import express from 'express';
import auth from '../../middlewares/auth';
import validate from '../../middlewares/validate';
import { postValidation } from '../../validations';
import { postController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(auth('managePosts'), validate(postValidation.createPost), postController.createPost);
router.route('/').get(auth('getPosts'), postController.getPosts);

router.route('/:postId').get(auth('getPosts'), postController.getPost);
// .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
// .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

export default router;

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Posts management and retrieval
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a post
 *     description: Only admins can create other posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 * get all posts:
 *   summary: Get all posts
 *   description: Only admins can retrieve all posts.
 *   tags: [Posts]
 *   security:
 *     - bearerAuth: []
 *   parameters:
 *     - in: query
 *       name: title
 *       schema:
 *         type: string
 *       description: Post title
 *     - in: query
 *       name: content
 *       schema:
 *         type: string
 *       description: Post content
 *     - in: query
 *       name: authorId
 *       schema:
 *         type: string
 *       description: Post author id
 *     - in: query
 *       name: viewCount
 *       schema:
 *         type: string
 *       description: Post view count
 *     - in: query
 *       name: published
 *       schema:
 *         type: string
 *       description: Post published
 *   responses:
 *     "200":
 *       description: OK
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               results:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Post'
 *               page:
 *                 type: integer
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 example: 10
 *               totalPages:
 *                 type: integer
 *                 example: 1
 *               totalResults:
 *                 type: integer
 *                 example: 1
 *     "401":
 *       $ref: '#/components/responses/Unauthorized'
 *     "403":
 *       $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post
 *     description: Logged in users can fetch only their own post. Only admins can fetch other posts.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Post'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
