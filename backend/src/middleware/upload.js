const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'notes');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'video/webm',
  'video/mp4',
  'video/ogg',
];

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const signatures = [
  { mime: 'audio/mpeg', extension: 'mp3', test: (bytes) => bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0 },
  { mime: 'audio/wav', extension: 'wav', test: (bytes) => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WAVE' },
  { mime: 'audio/ogg', extension: 'ogg', test: (bytes) => bytes.toString('ascii', 0, 4) === 'OggS' },
  { mime: 'audio/webm', extension: 'webm', test: (bytes) => bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3 },
  { mime: 'video/webm', extension: 'webm', test: (bytes) => bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3 },
  { mime: 'audio/mp4', extension: 'm4a', test: (bytes) => bytes.toString('ascii', 4, 8) === 'ftyp' },
  { mime: 'video/mp4', extension: 'mp4', test: (bytes) => bytes.toString('ascii', 4, 8) === 'ftyp' },
  { mime: 'video/ogg', extension: 'ogv', test: (bytes) => bytes.toString('ascii', 0, 4) === 'OggS' },
];

const validateAndStore = (req, res, next) => {
  if (!req.file) return next();
  const signature = signatures.find((candidate) => candidate.test(req.file.buffer));
  if (!signature || !allowedMimeTypes.includes(signature.mime) ||
      (req.file.mimetype !== signature.mime && !(signature.mime === 'audio/webm' && req.file.mimetype === 'video/webm') &&
       !(signature.mime === 'video/webm' && req.file.mimetype === 'audio/webm'))) {
    return next(new AppError('Unsupported or invalid media file.', 400));
  }
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  req.file.filename = `${uniqueSuffix}.${signature.extension}`;
  req.file.mimetype = signature.mime;
  fs.writeFile(path.join(uploadDir, req.file.filename), req.file.buffer, (error) => {
    if (error) return next(error);
    delete req.file.buffer;
    next();
  });
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

const handleUploadErrors = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File is too large. Maximum size is 50MB.', 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) {
      return next(err);
    }
    validateAndStore(req, res, next);
  });
};

module.exports = {
  single: (field) => handleUploadErrors(upload.single(field)),
};
