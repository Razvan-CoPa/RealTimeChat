const fs = require('fs');
const config = require('../config/config');

exports.handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File upload failed.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    storedName: req.file.filename,
  });
};

exports.removeFile = (fsPath) => {
  try {
    if (fsPath && fsPath.startsWith(config.UPLOAD_DIR)) {
      fs.unlinkSync(fsPath);
    }
  } catch (error) {
    console.error('Failed to remove file', error);
  }
};
