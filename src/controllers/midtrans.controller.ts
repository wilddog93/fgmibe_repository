// src/controllers/checkout.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { midtransService, checkoutService, webhookService } from '../services';
import catchAsync from '../utils/catchAsync';
import pick from '../utils/pick';

const createCheckoutProgram = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await checkoutService.checkoutProgram(payload);
  res.status(httpStatus.OK).send(data);
});

const midtransWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await webhookService.handleMidtransWebhook(payload);
  res.status(httpStatus.OK).send({ ok: true, result });
});

const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['order_id']);
  console.log(req, 'order_id by');
  const result = await midtransService.getTransactionStatus(filter);
  res.status(httpStatus.OK).send({ ok: true, result });
});

export default { createCheckoutProgram, midtransWebhook, getPaymentStatus };
