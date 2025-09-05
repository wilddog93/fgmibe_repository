// src/routes/ipaymu.routes.ts
import express from 'express';
import { ipaymuController } from '../../controllers';

const router = express.Router();

router.post('/checkout/program', ipaymuController.createCheckoutProgramIpaymu);
router.post('/webhook', ipaymuController.ipaymuWebhook);

export default router;
