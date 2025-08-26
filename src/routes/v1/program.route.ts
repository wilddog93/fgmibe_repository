import express from 'express';
import validate from '../../middlewares/validate';
import { programValidation } from '../../validations';
import { programController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(validate(programValidation.createProgram), programController.createProgram)
  .get(validate(programValidation.getPrograms), programController.getPrograms);

router
  .route('/:programId')
  .get(validate(programValidation.getProgram), programController.getProgram)
  .patch(validate(programValidation.updateProgram), programController.updateProgram)
  .delete(validate(programValidation.deleteProgram), programController.deleteProgram);

export default router;

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: Program management and retrieval
 */

/**
 * @swagger
 * /programs:
 *   post:
 *     summary: Create a program
 *     description: Only admins can create other programs.
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *               - priceMember
 *               - priceNonMember
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: YYYY-MM-DD
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: YYYY-MM-DD
 *               priceMember:
 *                 type: number
 *                 description: Price for members
 *               priceNonMember:
 *                 type: number
 *                 description: Price for non-members
 *               category:
 *                 type: string
 *                 enum: [WEBINAR, BOOTCAMP, TRAINING, OTHER]
 *                 description: Category
 *             example:
 *               name: AI & Data Workshop
 *               startDate: 2025-09-01
 *               endDate: 2025-09-03
 *               priceMember: 2000000
 *               priceNonMember: 1000000
 *               category: BOOTCAMP
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Program'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all programs
 *     description: Only admins can retrieve all programs.
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Program name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Program category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Program status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of programs
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Program'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /programs/{id}:
 *   get:
 *     summary: Get a program
 *     description: Logged in users can fetch only their own program information. Only admins can fetch other programs.
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Program id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Program'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a program
 *     description: Logged in users can only update their own information. Only admins can update other programs.
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Program id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: YYYY-MM-DD
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: YYYY-MM-DD
 *               priceMember:
 *                 type: number
 *                 description: Price for members
 *               priceNonMember:
 *                 type: number
 *                 description: Price for non-members
 *               category:
 *                 type: string
 *                 enum: [WEBINAR, BOOTCAMP, TRAINING, OTHER]
 *                 description: Category
 *             example:
 *               name: AI & Data Workshop
 *               startDate: 2025-09-01
 *               endDate: 2025-09-03
 *               priceMember: 2000000
 *               priceNonMember: 1000000
 *               category: BOOTCAMP
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Program'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a program
 *     description: Logged in users can delete only themselves. Only admins can delete other programs.
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Program id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
