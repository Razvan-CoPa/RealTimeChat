module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user1Id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user2Id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    participantKey: {
      type: DataTypes.STRING,
      unique: true,
    },
    isReadByUser1: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isReadByUser2: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    deletedByUser1: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedByUser2: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    hooks: {
      beforeValidate: (conversation) => {
        const ids = [conversation.user1Id, conversation.user2Id].sort();
        conversation.participantKey = ids.join(':');
      },
    },
  });

  return Conversation;
};
