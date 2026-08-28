const express = require('express');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require('../controllers/tasks.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All task routes are protected

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
