const { Op } = require('sequelize');
const { Conversation, Message, User } = require('../models');
const {
  hydrateConversation,
  getConversationsForUser,
  getConversationById,
  isParticipant,
} = require('../services/conversationService');

exports.list = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = await getConversationsForUser(userId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { email } = req.body;
    const currentUserId = req.user.id;

    if (!email) {
      return res.status(400).json({ message: 'Target email is required.' });
    }

    const targetUser = await User.findOne({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (targetUser.id === currentUserId) {
      return res.status(400).json({ message: 'Cannot start a conversation with yourself.' });
    }

    const participantKey = [currentUserId, targetUser.id].sort().join(':');
    let conversation = await Conversation.findOne({ where: { participantKey } });

    if (!conversation) {
      conversation = await Conversation.create({
        user1Id: currentUserId,
        user2Id: targetUser.id,
        isReadByUser1: true,
        isReadByUser2: true,
      });
    } else {
      if (conversation.user1Id === currentUserId) {
        conversation.deletedByUser1 = false;
        conversation.isReadByUser1 = true;
      } else {
        conversation.deletedByUser2 = false;
        conversation.isReadByUser2 = true;
      }
      await conversation.save();
    }

    conversation = await getConversationById(conversation.id);
    const payload = await hydrateConversation(conversation, currentUserId);
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    if (!isParticipant(conversation, userId)) {
      return res.status(403).json({ message: 'Not authorized to access this conversation.' });
    }

    const fieldsToUpdate = {};
    if (conversation.user1Id === userId) {
      fieldsToUpdate.isReadByUser1 = true;
    } else {
      fieldsToUpdate.isReadByUser2 = true;
    }

    await conversation.update(fieldsToUpdate);
    await Message.update(
      { readAt: new Date() },
      {
        where: {
          conversationId: id,
          senderId: { [Op.ne]: userId },
          readAt: null,
        },
      },
    );

    res.json({ message: 'Conversation marked as read.' });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    if (!isParticipant(conversation, userId)) {
      return res.status(403).json({ message: 'Not authorized to modify this conversation.' });
    }

    if (conversation.user1Id === userId) {
      conversation.deletedByUser1 = true;
    } else {
      conversation.deletedByUser2 = true;
    }

    await conversation.save();

    res.json({ message: 'Conversation deleted for current user.' });
  } catch (error) {
    next(error);
  }
};
