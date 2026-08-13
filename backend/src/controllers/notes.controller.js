const { Note } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const user_id = req.user.id;

    if (!title) {
      return next(new AppError('Please provide a title for the note', 400));
    }

    const note = await Note.create({
      title,
      content,
      user_id,
    });

    logger.info({ noteId: note.id, userId: user_id }, 'Note created successfully');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const getNotes = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const notes = await Note.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const note = await Note.findOne({
      where: { id, user_id },
    });

    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const user_id = req.user.id;

    const note = await Note.findOne({
      where: { id, user_id },
    });

    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();

    logger.info({ noteId: note.id, userId: user_id }, 'Note updated successfully');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const note = await Note.findOne({
      where: { id, user_id },
    });

    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    await note.destroy();

    logger.info({ noteId: id, userId: user_id }, 'Note deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
