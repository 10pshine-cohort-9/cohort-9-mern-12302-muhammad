const { Task } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const createTask = async (req, res, next) => {
  try {
    const { title } = req.body;
    const user_id = req.user.id;

    if (typeof title !== 'string' || title.trim() === '') {
      return next(new AppError('Please provide a title for the task', 400));
    }

    const task = await Task.create({
      title: title.trim(),
      user_id,
    });

    logger.info({ taskId: task.id, userId: user_id }, 'Task created successfully');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const tasks = await Task.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, is_completed } = req.body;
    const user_id = req.user.id;

    const task = await Task.findOne({
      where: { id, user_id },
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return next(new AppError('Please provide a title for the task', 400));
      }
      task.title = title.trim();
    }
    if (is_completed !== undefined) {
      if (typeof is_completed !== 'boolean') {
        return next(new AppError('is_completed must be a boolean', 400));
      }
      task.is_completed = is_completed;
    }

    await task.save();

    logger.info({ taskId: task.id, userId: user_id }, 'Task updated successfully');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const task = await Task.findOne({
      where: { id, user_id },
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    await task.destroy();

    logger.info({ taskId: id, userId: user_id }, 'Task deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
