const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const notesRoutes = require('./notes.routes');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);

module.exports = router;
