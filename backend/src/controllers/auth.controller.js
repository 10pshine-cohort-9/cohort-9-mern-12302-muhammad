const { User } = require('../models');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const logger = require('../config/logger');

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return next(new AppError('Invalid input type', 400));
    }

    if (!isValidEmail(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return next(new AppError('Email is already registered', 400));
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(user);

    logger.info({ userId: user.id }, 'User registered successfully');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return next(new AppError('Invalid input type', 400));
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      logger.warn('Login failed: User not found');
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn({ userId: user.id }, 'Login failed: Invalid password');
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user);

    logger.info({ userId: user.id }, 'User logged in successfully');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email && !newPassword) {
      return next(new AppError('Please provide an email or new password to update', 400));
    }

    if (!currentPassword) {
      return next(new AppError('Current password is required to update your profile', 400));
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    if (email) {
      if (typeof email !== 'string' || !isValidEmail(email)) {
        return next(new AppError('Please provide a valid email address', 400));
      }

      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
          return next(new AppError('Email is already registered', 400));
        }
        user.email = normalizedEmail;
      }
    }

    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
        return next(new AppError('Password must be at least 8 characters long', 400));
      }
      user.password = newPassword;
    }

    await user.save();

    logger.info({ userId: user.id }, 'User profile updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
};
