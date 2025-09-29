const { Op } = require('sequelize');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Conversation, Message, User } = require('../models');
const {
  getConversationById,
  hydrateConversation,
  isParticipant,
} = require('./conversationService');
const messageController = require('../controllers/messageController');

const onlineUsers = new Map();

/**
 * Extract token from socket handshake
 */
const getTokenFromHandshake = (socket) => {
  const auth = socket.handshake.auth;
  if (auth?.token) return auth.token;

  const header = socket.handshake.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.substring(7);
  }
  return null;
};

/**
 * ACK helper
 */
const ackResponse = (ack, ok, data = {}) => {
  if (typeof ack === 'function') {
    ack({ ok, ...data });
  }
};

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  /**
   * Auth middleware for sockets
   */
  io.use((socket, next) => {
    const token = getTokenFromHandshake(socket);
    if (!token) return next(new Error('Authentication error'));

    try {
      const payload = jwt.verify(token, config.SECRET_KEY);
      socket.userId = payload.id;
      return next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  /**
   * Notify only conversation participants about status changes
   */
  const notifyStatusChange = async (userId, status, lastSeen) => {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],

      },
    });

    conversations.forEach((conv) => {
      const otherUserId =
        conv.user1Id === userId ? conv.user2Id : conv.user1Id;

      io.to(`user:${otherUserId}`).emit('user:status', {
        userId,
        status,
        lastSeen,
      });
    });
  };

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    socket.join(`user:${userId}`);

    const connections = (onlineUsers.get(userId) || 0) + 1;
    onlineUsers.set(userId, connections);

    if (connections === 1) {
      await User.update({ lastSeen: new Date() }, { where: { id: userId } });
      notifyStatusChange(userId, 'online', null);
    }

    /**
     * Join conversation
     */
    socket.on('conversation:join', async (conversationId, ack) => {
      try {
        const conversation = await getConversationById(conversationId);
        if (!conversation || !isParticipant(conversation, userId)) {
          throw new Error('Unable to join conversation.');
        }

        socket.join(`conversation:${conversationId}`);
        ackResponse(ack, true);
      } catch (error) {
        ackResponse(ack, false, { message: error.message });
      }
    });

    /**
     * Leave conversation
     */
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    /**
     * Mark conversation as read
     */
    socket.on('conversation:markRead', async (conversationId, ack) => {
      try {
        const conversation = await getConversationById(conversationId);
        if (!conversation || !isParticipant(conversation, userId)) {
          throw new Error('Conversation not found.');
        }

        const updates = {};
        if (conversation.user1Id === userId) {
          updates.isReadByUser1 = true;
        } else {
          updates.isReadByUser2 = true;
        }
        await conversation.update(updates);
        await messageController.markMessagesAsRead(conversationId, userId);

        const refreshedConversation = await getConversationById(conversationId);

        const otherUserId =
          refreshedConversation.user1Id === userId
            ? refreshedConversation.user2Id
            : refreshedConversation.user1Id;

        const payloadForCurrent = await hydrateConversation(
          refreshedConversation,
          userId
        );
        const payloadForOther = await hydrateConversation(
          refreshedConversation,
          otherUserId
        );

        io.to(`user:${userId}`).emit('conversation:updated', payloadForCurrent);
        io.to(`user:${otherUserId}`).emit('conversation:updated', payloadForOther);

        ackResponse(ack, true);
      } catch (error) {
        ackResponse(ack, false, { message: error.message });
      }
    });

    /**
     * Send message
     */
    socket.on('message:send', async (data, ack) => {
      try {
        const { conversationId, content, fileUrl, fileName, fileType } = data;

        if (!conversationId || (!content && !fileUrl)) {
          throw new Error('Invalid payload.');
        }

        const conversation = await Conversation.findByPk(conversationId);
        if (!conversation || !isParticipant(conversation, userId)) {
          throw new Error('Conversation not found.');
        }

        const message = await Message.create({
          conversationId,
          senderId: userId,
          content: content || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileType: fileType || null,
        });

        if (conversation.user1Id === userId) {
          await conversation.update({
            isReadByUser1: true,
            isReadByUser2: false,
            deletedByUser2: false,
          });
        } else {
          await conversation.update({
            isReadByUser1: false,
            isReadByUser2: true,
            deletedByUser1: false,
          });
        }

        const otherUserId =
          conversation.user1Id === userId
            ? conversation.user2Id
            : conversation.user1Id;

        const enrichedMessage = await messageController.attachSender(message);

        // ✅ Send only once to participants (no duplication)
        io.to(`conversation:${conversationId}`).emit(
          'message:receive',
          enrichedMessage
        );

        const refreshedConversation = await getConversationById(conversationId);
        const payloadForSender = await hydrateConversation(
          refreshedConversation,
          userId
        );
        const payloadForRecipient = await hydrateConversation(
          refreshedConversation,
          otherUserId
        );

        io.to(`user:${userId}`).emit('conversation:updated', payloadForSender);
        io.to(`user:${otherUserId}`).emit(
          'conversation:updated',
          payloadForRecipient
        );

        ackResponse(ack, true, { message: enrichedMessage });
      } catch (error) {
        ackResponse(ack, false, { message: error.message });
      }
    });

    /**
     * Disconnect
     */
    socket.on('disconnect', async () => {
      const remaining = (onlineUsers.get(userId) || 1) - 1;
      if (remaining <= 0) {
        onlineUsers.delete(userId);
        const lastSeen = new Date();
        await User.update({ lastSeen }, { where: { id: userId } });
        notifyStatusChange(userId, 'offline', lastSeen.toISOString());
      } else {
        onlineUsers.set(userId, remaining);
      }
    });
  });

  return io;
};
