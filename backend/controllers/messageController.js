const { Op } = require('sequelize');
const { Conversation, Message, User } = require('../models');
const {
  getConversationById,
  isParticipant,
  sanitizeMessage,
} = require('../services/conversationService');

exports.list = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    if (!isParticipant(conversation, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this conversation.' });
    }

    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages.map(sanitizeMessage));
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, fileUrl, fileName, fileType } = req.body;
    const senderId = req.user.id;

    if (!content && !fileUrl) {
      return res.status(400).json({ message: 'Message content or file is required.' });
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    if (!isParticipant(conversation, senderId)) {
      return res.status(403).json({ message: 'Not authorized to access this conversation.' });
    }

    const message = await Message.create({
      senderId,
      conversationId,
      content: content || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileType: fileType || null,
    });

    if (conversation.user1Id === senderId) {
      conversation.isReadByUser1 = true;
      conversation.isReadByUser2 = false;
      conversation.deletedByUser2 = false;
    } else {
      conversation.isReadByUser1 = false;
      conversation.isReadByUser2 = true;
      conversation.deletedByUser1 = false;
    }
    await conversation.save();

    res.status(201).json(sanitizeMessage(message));
  } catch (error) {
    next(error);
  }
};

exports.markMessagesAsRead = async (conversationId, userId) => {
  await Message.update(
    { readAt: new Date() },
    {
      where: {
        conversationId,
        senderId: { [Op.ne]: userId },
        readAt: null,
      },
    },
  );
};

exports.attachSender = async (message) => {
  const sender = await User.findByPk(message.senderId);
  return {
    ...sanitizeMessage(message),
    sender: sender
      ? {
          id: sender.id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          email: sender.email,
          theme: sender.theme,
          backgroundUrl: sender.backgroundUrl,
        }
      : null,
  };
};
