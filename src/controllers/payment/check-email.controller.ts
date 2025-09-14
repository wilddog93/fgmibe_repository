import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { checkEmailService } from '../../services';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick';

const checkEmailRegistrationProgram = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['email']);
  const result = await checkEmailService.checkEmailRegistrationProgram(filter);
  res.status(httpStatus.OK).send(result);
});

const checkEmailRegistrationMember = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['email']);
  const result = await checkEmailService.checkEmailRegistrationMember(filter);
  res.status(httpStatus.OK).send(result);
});

export default {
  checkEmailRegistrationProgram,
  checkEmailRegistrationMember
};
