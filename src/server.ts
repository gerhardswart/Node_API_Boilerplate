import dotenv from 'dotenv';
import app from './app';
import config from './config';
import logger from './config/logger';
import type { Server } from 'http';

dotenv.config();

const PORT = config.port;

const server: Server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api/v1`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
    process.exit(0);
  });
});

export default server;
