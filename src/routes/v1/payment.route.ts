// src/routes/payment.routes.ts
import express from 'express';
import { midtransController, ipaymuController } from '../../controllers';
import validate from '../../middlewares/validate';
import { ipaymuVerificationMiddleware } from '../../middlewares/ipaymuVerification';
import { checkoutValidation, webhookValidation, midtransValidation } from '../../validations';

const router = express.Router();

router.get(
  '/status',
  validate(midtransValidation.statusSchema),
  midtransController.getPaymentStatus
);
router.get('/check/email-register-program', midtransController.checkEmailRegistrationProgram);
router.get('/check/email-register-member', midtransController.checkEmailRegistrationMember);

router.post(
  '/checkout/program',
  validate(checkoutValidation.checkoutSchema),
  midtransController.createCheckoutProgram
);
router.post(
  '/checkout/program/snap',
  validate(checkoutValidation.checkoutSchema),
  midtransController.createCheckoutProgramSnap
);

router.post(
  '/checkout/member',
  validate(checkoutValidation.checkoutMemberSchema),
  midtransController.createCheckoutMember
);

router.post(
  '/checkout/member/snap',
  validate(checkoutValidation.checkoutMemberSchema),
  midtransController.createCheckoutMemberSnap
);

// ipaymu
router.post('/checkout/program/ipaymu', ipaymuController.createCheckoutProgramIpaymu);
router.post('/checkout/member/ipaymu', ipaymuController.createCheckoutMemberIpaymu);

router.post(
  '/midtrans/webhook',
  validate(webhookValidation.webhookSchema),
  midtransController.midtransWebhook
);

// ipaymu notify webhook
router.post(
  '/ipaymu/webhook',
  // ipaymuVerificationMiddleware,
  validate(webhookValidation.ipaymuWebhookSchema),
  ipaymuController.ipaymuWebhook
);
export default router;

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Midtrans payment
 */

/**
 * @swagger
 * tags:
 *   name: Payment - Ipaymu
 *   description: Ipaymu payment
 */

/**
 * @swagger
 * /payment/checkout/program:
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

/**
 * @swagger
 * /payment/checkout/program/snap:
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
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "409":
 *         $ref: '#/components/responses/Conflict'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *       "503":
 *         $ref: '#/components/responses/ServiceUnavailable'
 *
 */

/**
 * @swagger
 * /payment/midtrans/webhook:
 *   post:
 *     summary: Midtrans webhook
 *     description: Midtrans webhook
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
 *               - orderId
 *               - status
 *               - grossAmount
 *               - statusCode
 *               - signatureKey
 *               - fraudStatus
 *               - paymentType
 *               - transactionTime
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order id
 *               status:
 *                 type: string
 *                 description: Status
 *               grossAmount:
 *                 type: string
 *                 description: Gross amount
 *               statusCode:
 *                 type: string
 *                 description: Status code
 *               signatureKey:
 *                 type: string
 *                 description: Signature key
 *               fraudStatus:
 *                 type: string
 *                 description: Fraud status
 *               paymentType:
 *                 type: string
 *                 description: Payment type
 *               transactionTime:
 *                 type: string
 *                 description: Transaction time
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: OK
 *                 result:
 *                   type: object
 *                   description: Result
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /payment/status:
 *   get:
 *     summary: Get payment status
 *     description: Midtrans status
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
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 description: Order id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: OK
 *                 result:
 *                   type: object
 *                   description: Result
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 *
 * @swagger
 * /payment/check/email-register-program:
 *   get:
 *     summary: Check email registration from User/Member/Program Registration email
 *     description: Check email registration from User/Member/Program Registration email
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email
 *       - in: query
 *         name: programId
 *         schema:
 *           type: string
 *         description: Program id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: OK
 *                 result:
 *                   type: object
 *                   description: Result
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "409":
 *         $ref: '#/components/responses/Conflict'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *       "503":
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagger
 * /payment/check/email-register-member:
 *   get:
 *     summary: Check email registration from User/Member/Program Registration email
 *     description: Check email registration from User/Member/Program Registration email
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: OK
 *                 result:
 *                   type: object
 *                   description: Result
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "409":
 *         $ref: '#/components/responses/Conflict'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *       "503":
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagger
 * /payment/ipaymu/webhook:
 *   post:
 *     summary: Ipaymu webhook
 *     description: Ipaymu webhook
 *     tags: [Payment - Ipaymu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - SessionId
 *               - TransactionId
 *               - ReferenceId
 *               - PaymentChannel
 *               - Amount
 *               - Status
 *             properties:
 *               SessionId:
 *                 type: string
 *                 description: Session id
 *               TransactionId:
 *                 type: string
 *                 description: Transaction id
 *               ReferenceId:
 *                 type: string
 *                 description: Reference id
 *               PaymentChannel:
 *                 type: string
 *                 description: Payment channel
 *               Amount:
 *                 type: string
 *                 description: Amount
 *               Status:
 *                 type: string
 *                 description: Status
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: OK
 *                 result:
 *                   type: object
 *                   description: Result
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /checkout/program/ipaymu:
 *   post:
 *     summary: Create payment checkout
 *     description: Ipaymu checkout
 *     tags: [Payment - Ipaymu]
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
 *                 ipaymu:
 *                   type: object
 *                   description: Ipaymu response
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "409":
 *         $ref: '#/components/responses/Conflict'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *       "503":
 *         $ref: '#/components/responses/ServiceUnavailable'
 *
 */

/**
 * @swagger
 * /checkout/member/ipaymu:
 *   post:
 *     summary: Create payment checkout
 *     description: Ipaymu checkout
 *     tags: [Payment - Ipaymu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - membershipPackageId
 *               - email
 *               - name
 *               - phone
 *               - institution
 *               - segment
 *               - interestAreas
 *               - joinDate
 *               - method
 *             properties:
 *               membershipPackageId:
 *                 type: string
 *                 format: uuid
 *                 description: Membership package id
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
 *               interestAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Interest areas
 *               joinDate:
 *                 type: string
 *                 format: date
 *                 description: Join date
 *               method:
 *                 type: string
 *                 enum: [QRIS, BANK_TRANSFER, EWALLET]
 *                 default: QRIS
 *                 description: Payment method
 *             example:
 *               membershipPackageId: 12345678-1234-1234-1234-123456789012
 *               email: fake@example.com
 *               name: fake name
 *               phone: 08123456789
 *               institution: NusaTen
 *               segment: FRESH_GRADUATE
 *               interestAreas: ['IT', 'ENGINEERING']
 *               joinDate: '2022-01-01'
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
 *                 ipaymu:
 *                   type: object
 *                   description: Ipaymu response
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "409":
 *         $ref: '#/components/responses/Conflict'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *       "503":
 *         $ref: '#/components/responses/ServiceUnavailable'
 *
 */
