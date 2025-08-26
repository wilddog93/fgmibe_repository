import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';

const getHealth = catchAsync(async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    nodeVersion: process.version,
    pid: process.pid
  };
  res.status(httpStatus.OK).send(health);
});

export default {
  getHealth
};
