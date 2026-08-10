const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { User } = require('../models');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication failed: No token provided', 401));
    }

    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn({ err: error.message }, 'Authentication token verification failed');
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(error);
  }
};

module.exports = {
  protect,
};
