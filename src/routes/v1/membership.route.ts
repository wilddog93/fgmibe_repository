import express from 'express';
import validate from '../../middlewares/validate';
import { membershipValidation } from '../../validations';
import { membershipController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .post(
    validate(membershipValidation.createMembershipPackage),
    membershipController.createMembershipPackage
  )
  .get(
    validate(membershipValidation.getMembershipPackages),
    membershipController.getMembershipPackages
  );

router
  .route('/:membershipPackageId')
  .get(
    validate(membershipValidation.getMembershipPackage),
    membershipController.getMembershipPackage
  )
  .patch(
    validate(membershipValidation.updateMembershipPackage),
    membershipController.updateMembershipPackage
  )
  .delete(
    validate(membershipValidation.deleteMembershipPackage),
    membershipController.deleteMembershipPackage
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: Membership
 *   description: Membership management and retrieval
 */

/**
 * @swagger
 * /memberships:
 *   get:
 *     summary: Get all memberships
 *     description: Public can retrieve all memberships.
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Membership id
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Membership name
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Membership description
 *       - in: query
 *         name: price
 *         schema:
 *           type: number
 *         description: Membership price
 *       - in: query
 *         name: createdAt
 *         schema:
 *           type: string
 *         description: YYYY-MM-DD
 *       - in: query
 *         name: updatedAt
 *         schema:
 *           type: string
 *         description: YYYY-MM-DD
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
 *                     $ref: '#/components/schemas/Membership'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalItems:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /memberships/{id}:
 *   get:
 *     summary: Get a membership
 *     description: Public can fetch other memberships.
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Membership'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a membership
 *     description: Only admins can update other memberships.
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *             example:
 *               name: AI & Data Workshop
 *               description: AI & Data Workshop
 *               price: 2000000
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Membership'
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
 *     summary: Delete a membership
 *     description: Only admins can delete other memberships.
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership id
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

/**
 * @swagger
 * /memberships/create:
 *   post:
 *     summary: Create a membership
 *     description: Only admins can create other memberships.
 *     tags: [Membership]
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
 *               - description
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name
 *               description:
 *                 type: string
 *                 description: Description
 *               price:
 *                 type: number
 *                 description: Price
 *             example:
 *               name: AI & Data Workshop
 *               description: AI & Data Workshop
 *               price: 2000000
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Membership'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
