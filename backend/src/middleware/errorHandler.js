const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  }, `Exception caught in middleware: ${err.message}`);

  const message = err.isOperational ? err.message : 'Internal Server Error';

  const response = {
    success: false,
    status: err.statusCode,
    message,
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

module.exports = errorHandler;
