const express = require('express');
const conversationController = require('../controllers/conversationController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', conversationController.list);
router.post('/', conversationController.create);
router.patch('/:id/mark-read', conversationController.markAsRead);
router.delete('/:id', conversationController.remove);

module.exports = router;
