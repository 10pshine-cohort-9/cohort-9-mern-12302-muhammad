const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const AppError = require('./utils/AppError');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pino HTTP request logging
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Base route test
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Notes App Backend API',
    docs: '/api/health',
  });
});

// Handle 404 for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
