import express from 'express';
import validate from '../../middlewares/validate';
import { memberValidation } from '../../validations';
import { memberController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(validate(memberValidation.createMember), memberController.createMember)
  .get(validate(memberValidation.getMembers), memberController.getMembers);

router
  .route('/:memberId')
  .get(validate(memberValidation.getMember), memberController.getMember)
  .patch(validate(memberValidation.updateMember), memberController.updateMember)
  .delete(validate(memberValidation.deleteMember), memberController.deleteMember);

export default router;

/**
 * @swagger
 * tags:
 *   name: Member
 *   description: Member management and retrieval
 */

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Create a member
 *     description: Only admins can create other members.
 *     tags: [Member]
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
 *               - email
 *               - phone
 *               - institution
 *               - segment
 *               - interestAreas
 *               - joinDate
 *               - status
 *               - membershipPackageId
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email
 *               phone:
 *                 type: string
 *                 description: Phone
 *               institution:
 *                 type: string
 *                 description: Institution
 *               segment:
 *                 type: string
 *                 enum: [STUDENT, FRESH_GRADUATE, PROFESSIONAL, BASIC]
 *                 description: Segment
 *               interestAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Interest areas
 *               joinDate:
 *                 type: string
 *                 format: date
 *                 description: YYYY-MM-DD
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 description: Status
 *               membershipPackageId:
 *                 type: string
 *                 format: uuid
 *                 description: Membership package id
 *               userId:
 *                 type: number
 *                 description: User id
 *             example:
 *               name: Nusa Tenggara Timur
 *               email: fake@example.com
 *               phone: 08123456789
 *               institution: Nusa Tenggara Timur
 *               segment: FRESH_GRADUATE
 *               interestAreas:
 *                 - AI
 *                 - Data
 *               joinDate: 2025-09-01
 *               status: ACTIVE
 *               membershipPackageId: 12345678-1234-1234-1234-123456789012
 *               userId: 1
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Member'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Get a member
 *     description: Public can fetch other members.
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Member'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a member
 *     description: Logged in users can only update their own information. Only admins can update other members.
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               institution:
 *                 type: string
 *               segment:
 *                 type: string
 *                 enum: [STUDENT, FRESH_GRADUATE, PROFESSIONAL, BASIC]
 *               interestAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               name: Nusa Tenggara Timur
 *               email: fake@example.com
 *               phone: 08123456789
 *               institution: Nusa Tenggara Timur
 *               segment: FRESH_GRADUATE
 *               interestAreas:
 *                 - AI
 *                 - Data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Member'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a member
 *     description: Only admins can delete other members.
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "409":
 *         $ref: '#/components/responses/Conflict'
 */
