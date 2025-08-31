import express from 'express';
import validate from '../../middlewares/validate';
import { programRegistrationValidation } from '../../validations';
import { programRegistrationController } from '../../controllers';

const router = express.Router();

router
  .route('/')
  .get(
    validate(programRegistrationValidation.getProgramRegistration),
    programRegistrationController.getProgramRegistration
  );

export default router;

/**
 * @swagger
 * tags:
 *   name: Program Registrations
 *   description: Program registration management
 */

/**
 * @swagger
 * /program-registrations:
 *   get:
 *     summary: Get program registrations
 *     tags: [Program Registrations]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Program registration ID
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email address
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Phone number
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *         description: User segment
 *       - in: query
 *         name: institution
 *         schema:
 *           type: string
 *         description: Institution name
 *       - in: query
 *         name: registeredAt
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Registration date
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Registration source
 *       - in: query
 *         name: program
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         description: Program information
 *       - in: query
 *         name: member
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         description: Member information
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
