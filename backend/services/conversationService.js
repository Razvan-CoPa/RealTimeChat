
const { Op } = require('sequelize');
const { Conversation, Message, User } = require('../models');

const sanitizeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  lastSeen: user.lastSeen,
});

const sanitizeMessage = (message) => {
  if (!message) {
    return null;
  }
  return {
    id: message.id,
    senderId: message.senderId,
    conversationId: message.conversationId,
    content: message.content,
    fileUrl: message.fileUrl,
    fileName: message.fileName,
    fileType: message.fileType,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    readAt: message.readAt,
  };
};

const attachUsersIfMissing = async (conversation) => {
  if (!conversation.user1 || !conversation.user2) {
    const hydrated = await Conversation.findByPk(conversation.id, {
      include: [
        { model: User, as: 'user1' },
        { model: User, as: 'user2' },
      ],
    });
    return hydrated;
  }
  return conversation;
};

const hydrateConversation = async (conversation, currentUserId) => {
  const hydratedConversation = await attachUsersIfMissing(conversation);
  const lastMessage = await Message.findOne({
    where: { conversationId: hydratedConversation.id },
    order: [['createdAt', 'DESC']],
  });

  const otherUser =
    hydratedConversation.user1Id === currentUserId
      ? hydratedConversation.user2
      : hydratedConversation.user1;

  return {
    id: hydratedConversation.id,
    user1Id: hydratedConversation.user1Id,
    user2Id: hydratedConversation.user2Id,
    isReadByUser1: hydratedConversation.isReadByUser1,
    isReadByUser2: hydratedConversation.isReadByUser2,
    deletedByUser1: hydratedConversation.deletedByUser1,
    deletedByUser2: hydratedConversation.deletedByUser2,
    createdAt: hydratedConversation.createdAt,
    updatedAt: hydratedConversation.updatedAt,
    otherUser: sanitizeUser(otherUser),
    lastMessage: sanitizeMessage(lastMessage),
  };
};

const getConversationsForUser = async (userId) => {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [
        { user1Id: userId, deletedByUser1: false },
        { user2Id: userId, deletedByUser2: false },
      ],
    },
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
    order: [['updatedAt', 'DESC']],
  });

  return Promise.all(conversations.map((conversation) => hydrateConversation(conversation, userId)));
};

const getConversationById = async (conversationId) => {
  return Conversation.findByPk(conversationId, {
    include: [
      { model: User, as: 'user1' },
      { model: User, as: 'user2' },
    ],
  });
};

const isParticipant = (conversation, userId) => {
  return [conversation.user1Id, conversation.user2Id].includes(userId);
};

module.exports = {
  sanitizeUser,
  sanitizeMessage,
  hydrateConversation,
  getConversationsForUser,
  getConversationById,
  isParticipant,
};
