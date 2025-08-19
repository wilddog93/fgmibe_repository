// src/controllers/checkout.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { startCheckout } from '../services/checkout.service';
import catchAsync from '../utils/catchAsync';
import { handleMidtransWebhook } from '../services/webhook.service';

const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const data = await startCheckout(req.body); // validate body with Joi/Zod
  res.status(httpStatus.OK).send(data);
});

const midtransWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await handleMidtransWebhook(payload);
  res.status(httpStatus.OK).send({ ok: true, result });
});

export default { createCheckout, midtransWebhook };
