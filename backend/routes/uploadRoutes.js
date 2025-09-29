const express = require('express');
const upload = require('../services/upload');
const uploadController = require('../controllers/uploadController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, upload.single('file'), uploadController.handleUpload);

module.exports = router;
