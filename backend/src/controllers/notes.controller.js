const fs = require('fs');
const path = require('path');
const { Note } = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

const deleteMediaFile = (mediaUrl) => {
  if (!mediaUrl) return;
  const filePath = path.join(__dirname, '..', '..', mediaUrl.replace(/^\//, ''));
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      logger.warn({ err, filePath }, 'Failed to delete media file');
    }
  });
};

const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, type } = req.body;
    const user_id = req.user.id;

    if (typeof title !== 'string' || title.trim() === '') {
      return next(new AppError('Please provide a title for the note', 400));
    }

    const noteType = ['text', 'voice', 'video'].includes(type) ? type : 'text';

    if ((noteType === 'voice' || noteType === 'video') && !req.file) {
      return next(new AppError(`Please provide a ${noteType} recording`, 400));
    }

    const note = await Note.create({
      title,
      content,
      tags,
      type: noteType,
      media_url: req.file ? `/uploads/notes/${req.file.filename}` : null,
      media_mime: req.file ? req.file.mimetype : null,
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
    const { title, content, tags, type } = req.body;
    const user_id = req.user.id;

    const note = await Note.findOne({
      where: { id, user_id },
    });

    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return next(new AppError('Please provide a title for the note', 400));
      }
      note.title = title;
    }
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (type !== undefined && ['text', 'voice', 'video'].includes(type)) note.type = type;

    if (req.file) {
      deleteMediaFile(note.media_url);
      note.media_url = `/uploads/notes/${req.file.filename}`;
      note.media_mime = req.file.mimetype;
    }

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

    deleteMediaFile(note.media_url);
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
