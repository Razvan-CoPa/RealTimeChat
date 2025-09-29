const bcrypt = require('bcryptjs');
const db = require('../models');

const seed = async () => {
  try {
    // Disable FK checks (SQLite only)
    await db.sequelize.query('PRAGMA foreign_keys = OFF');

    // Drop and recreate tables
    await db.sequelize.sync({ force: true });

    // Re-enable FK checks
    await db.sequelize.query('PRAGMA foreign_keys = ON');

    // Create users
    const password = await bcrypt.hash('password123', 10);

    const alice = await db.User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      passwordHash: password,
      lastSeen: new Date(),
    });

    const bob = await db.User.create({
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      passwordHash: password,
      lastSeen: new Date(Date.now() - 10 * 60 * 1000),
      theme: 'light',
      backgroundUrl: null,
    });

    const charlie = await db.User.create({
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
      passwordHash: password,
      lastSeen: new Date(Date.now() - 60 * 60 * 1000),
      theme: 'dark',
      backgroundUrl: null,
    });

    // Conversations & messages
    const conversation = await db.Conversation.create({
      user1Id: alice.id,
      user2Id: bob.id,
      isReadByUser1: true,
      isReadByUser2: false,
    });

    await db.Message.create({
      conversationId: conversation.id,
      senderId: bob.id,
      content: 'Hey Alice! How are you?',
    });

    const conversation2 = await db.Conversation.create({
      user1Id: alice.id,
      user2Id: charlie.id,
      isReadByUser1: true,
      isReadByUser2: true,
    });

    await db.Message.create({
      conversationId: conversation2.id,
      senderId: alice.id,
      content: 'Hi Charlie, check out this doc.',
      fileUrl: '/uploads/sample.docx',
      fileName: 'project-brief.docx',
      fileType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      readAt: new Date(Date.now() - 9 * 60 * 1000),
    });

    console.log('✅ Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed', error);
    process.exit(1);
  }
};

seed();
