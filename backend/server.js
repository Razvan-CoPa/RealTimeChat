
const express = require('express');
const http = require('http');
const cors = require('cors');
const passport = require('passport');
const config = require('./config/config');
const db = require('./models');
const configurePassport = require('./middleware/passport');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const socketService = require('./services/socket');

const app = express();

app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(config.UPLOAD_DIR));

configurePassport(passport);
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/conversations', conversationRoutes);
app.use('/messages', messageRoutes);
app.use('/upload', uploadRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use(errorHandler);

const server = http.createServer(app);
socketService(server);

const start = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    server.listen(config.PORT, () => {
      console.log(`Server listening on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();

module.exports = { app, server };

