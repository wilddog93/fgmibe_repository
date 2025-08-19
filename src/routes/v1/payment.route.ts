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

export default router;
