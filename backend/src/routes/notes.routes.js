const express = require('express');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require('../controllers/notes.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All note routes are protected

router.route('/')
  .post(createNote)
  .get(getNotes);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
