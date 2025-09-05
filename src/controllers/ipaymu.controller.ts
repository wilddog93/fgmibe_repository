// src/controllers/ipaymu.controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { checkoutIpaymuService, ipaymuWebhookService } from '../services';

export const createCheckoutProgramIpaymu = catchAsync(async (req: Request, res: Response) => {
  const data = await checkoutIpaymuService.checkoutProgramIpaymu(req.body);
  res.status(httpStatus.OK).send(data);
});

export const createCheckoutMemberIpaymu = catchAsync(async (req: Request, res: Response) => {
  const data = await checkoutIpaymuService.checkoutRegisterMemberIpaymu(req.body);
  res.status(httpStatus.OK).send(data);
});

export const ipaymuWebhook = catchAsync(async (req: Request, res: Response) => {
  const result = await ipaymuWebhookService.handleIpaymuWebhook(req.body);
  res.status(httpStatus.OK).send({ ok: true, result });
});

export default {
  createCheckoutProgramIpaymu,
  createCheckoutMemberIpaymu,
  ipaymuWebhook
};
