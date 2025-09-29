const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const config = require('../config/config');

if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.DB_PATH,
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = require('./User')(sequelize, DataTypes);
db.Conversation = require('./Conversation')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);

db.User.hasMany(db.Conversation, { foreignKey: 'user1Id', as: 'conversationsAsUser1' });
db.User.hasMany(db.Conversation, { foreignKey: 'user2Id', as: 'conversationsAsUser2' });
db.Conversation.belongsTo(db.User, { foreignKey: 'user1Id', as: 'user1' });
db.Conversation.belongsTo(db.User, { foreignKey: 'user2Id', as: 'user2' });

db.Conversation.hasMany(db.Message, { foreignKey: 'conversationId', as: 'messages' });
db.Message.belongsTo(db.Conversation, { foreignKey: 'conversationId', as: 'conversation' });
db.Message.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.User.hasMany(db.Message, { foreignKey: 'senderId', as: 'messages' });

module.exports = db;
