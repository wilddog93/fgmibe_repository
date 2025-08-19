// src/routes/payment.routes.ts
import express from 'express';
import { midtransController } from '../../controllers';
import validate from '../../middlewares/validate';
import { checkoutValidation } from '../../validations';

const router = express.Router();

router.post(
  '/checkout',
  validate(checkoutValidation.checkoutSchema),
  midtransController.createCheckout
);
router.post('/midtrans/webhook', midtransController.midtransWebhook);

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Midtrans payment
 */

/**
 * @Swagger
 * /payment/checkout:
 *   post:
 *     description: Create checkout
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Checkout'
 *     responses:
 *       200:
 *         description: Checkout created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * @swagger
 * components:
 *   schemas:
 *     Checkout:
 *       type: object
 *       properties:
 *         programId:
 *           type: string
 *           description: Program ID
 *         email:
 *           type: string
 *           description: Email
 *         name:
 *           type: string
 *           description: Name
 *         phone:
 *           type: string | null
 *           description: Phone
 *         institution:
 *           type: string | null
 *           description: Institution
 *         segment: any | null
 *           description: Segment
 *         programPackage:
 *           type: string | null
 *           description: Program package
 *         method:
 *           type: string
 *           description: Payment method
 *           enum:
 *             - QRIS
 *             - GOPAY
 *         userId:
 *           type: number | null
 *           description: User ID
 *       required:
 *         - programId
 *         - email
 *         - name
 *         - method (QRIS | GOPAY)
 *     CheckoutResponse:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           description: Order ID
 *         amount:
 *           type: number
 *           description: Amount
 *         currency:
 *           type: string
 *           description: Currency
 *         midtrans:
 *           type: object
 *           description: Midtrans response
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Error message
 *         data:
 *           type: object
 *           description: Additional error data
 *       required:
 *         - status
 *         - message
 *         - data
 * @swagger
 * /payment/midtrans/webhook:
 *   post:
 *     description: Midtrans webhook
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: Order ID
 *               status_code:
 *                 type: string
 *                 description: Status code
 *               gross_amount:
 *                 type: string
 *                 description: Gross amount
 *               signature_key:
 *                 type: string
 *                 description: Signature key
 *     responses:
 *       200:
 *         description: Webhook received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: Webhook status
 *                 result:
 *                   type: object
 *                   description: Webhook result
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: number
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Error message
 *         data:
 *           type: object
 *           description: Additional error data
 *       required:
 *         - status
 *         - message
 *         - data
 */

export default router;
