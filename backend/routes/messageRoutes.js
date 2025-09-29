const express = require('express');
const messageController = require('../controllers/messageController');
const authenticate = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/:conversationId', messageController.list);
router.post('/:conversationId', messageController.create);

module.exports = router;
