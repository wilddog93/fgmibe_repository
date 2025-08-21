// src/controllers/checkout.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { startCheckoutProgram } from '../services/checkout.service';
import catchAsync from '../utils/catchAsync';
import { handleMidtransWebhook } from '../services/webhook.service';

const createCheckoutProgram = catchAsync(async (req: Request, res: Response) => {
  const data = await startCheckoutProgram(req.body); // validate body with Joi/Zod
  res.status(httpStatus.OK).send(data);
});

const midtransWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await handleMidtransWebhook(payload);
  res.status(httpStatus.OK).send({ ok: true, result });
});

export default { createCheckoutProgram, midtransWebhook };
