import { Server } from 'http';
import app from './app';
import prisma from './client';
import config from './config/config';
import logger from './config/logger';
import { initRedis } from './config/redis';

let server: Server;

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('✅ Connected to SQL Database');

    await initRedis(); // 🔑 connect redis sebelum listen
    logger.info('✅ Connected to Redis');

    server = app.listen(config.port, () => {
      logger.info(`🚀 Listening to port ${config.port}`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server', err);
    process.exit(1);
  }
}

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
