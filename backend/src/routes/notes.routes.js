const express = require('express');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require('../controllers/notes.controller');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All note routes are protected

router.route('/')
  .post(upload.single('media'), createNote)
  .get(getNotes);

router.route('/:id')
  .get(getNoteById)
  .put(upload.single('media'), updateNote)
  .delete(deleteNote);

module.exports = router;
