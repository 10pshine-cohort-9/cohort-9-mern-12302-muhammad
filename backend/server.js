require('dotenv').config();

const logger = require('./src/config/logger');

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'UNCAUGHT EXCEPTION! Shutting down server...');
  process.exit(1);
});

const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
  logger.error('FATAL ERROR: JWT_SECRET is not defined or is set to a placeholder value.');
  process.exit(1);
}

let server;

const startServer = async () => {
  try {
    // 1. Connect to MySQL Database
    await connectDB();

    // 2. Synchronize Database Models
    const isDevelopmentDatabase = process.env.NODE_ENV === 'development' &&
      process.env.DB_NAME && process.env.DB_NAME.toLowerCase().includes('dev');
    await sequelize.sync(isDevelopmentDatabase ? { alter: true } : {});
    logger.info('Database tables synchronized successfully (Users & Notes)');

    // 3. Start Express HTTP Server
    server = app.listen(PORT, () => {
      logger.info(`Notes App Backend running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
      logger.info(`Health Check Endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'UNHANDLED REJECTION! Shutting down server...');
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

startServer();
