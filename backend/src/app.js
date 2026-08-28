const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const AppError = require('./utils/AppError');
const { Note } = require('./models');
const { protect } = require('./middleware/authMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pino HTTP request logging
app.use(requestLogger);

// Serve uploaded media files (voice/video notes)
app.get('/uploads/notes/:filename', protect, async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const mediaUrl = `/uploads/notes/${filename}`;
    const note = await Note.findOne({ where: { media_url: mediaUrl, user_id: req.user.id } });
    if (!note) return next(new AppError('Media not found', 404));
    if (note.media_mime) res.type(note.media_mime);
    return res.sendFile(path.join(__dirname, '..', 'uploads', 'notes', filename));
  } catch (error) {
    return next(error);
  }
});

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
