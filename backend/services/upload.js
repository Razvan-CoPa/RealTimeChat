const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const config = require('../config/config');

const allowedMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
      .replace(/[\s]/g, '')
      .toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed: png, jpg, pdf, docx.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;
