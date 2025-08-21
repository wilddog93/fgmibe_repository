// src/routes/payment.routes.ts
import express from 'express';
import { midtransController } from '../../controllers';
import validate from '../../middlewares/validate';
import { checkoutValidation } from '../../validations';

const router = express.Router();

router.post(
  '/payment/checkout',
  validate(checkoutValidation.checkoutSchema),
  midtransController.createCheckout
);
router.post('/payment/midtrans/webhook', midtransController.midtransWebhook);

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Midtrans payment
 */

/**
 * @swagger
 * /payment/checkout:
 *   post:
 *     summary: Create payment checkout
 *     description: Midtrans checkout
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - programId
 *               - email
 *               - name
 *               - phone
 *               - institution
 *               - segment
 *               - programPackage
 *               - method
 *             properties:
 *               programId:
 *                 type: string
 *                 format: uuid
 *                 description: Program id
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email
 *               name:
 *                 type: string
 *                 description: Name
 *               phone:
 *                 type: string
 *                 description: Phone
 *               institution:
 *                 type: string
 *                 description: Institution
 *               segment:
 *                 type: string
 *                 enum: [STUDENT, FRESH_GRADUATE, PROFESSIONAL]
 *                 description: Segment
 *               programPackage:
 *                 type: string
 *                 description: Program package
 *               method:
 *                 type: string
 *                 enum: [QRIS, BANK_TRANSFER, EWALLET]
 *                 default: QRIS
 *                 description: Payment method
 *             example:
 *               programId: 12345678-1234-1234-1234-123456789012
 *               email: fake@example.com
 *               name: fake name
 *               phone: 08123456789
 *               institution: NusaTen
 *               segment: FRESH_GRADUATE
 *               programPackage: STANDARD
 *               method: QRIS
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: Order id
 *                 amount:
 *                   type: number
 *                   description: Amount
 *                 currency:
 *                   type: string
 *                   description: Currency
 *                 midtrans:
 *                   type: object
 *                   description: Midtrans response
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

export default router;
