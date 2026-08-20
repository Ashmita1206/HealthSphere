require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const chatRoutes = require('./routes/chat.Routes');
const newChatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Socket
const registerChatSocket = require('./sockets/chat.socket');
const registerNotificationSocket = require('./sockets/notification.socket');

const app = express();
const httpServer = createServer(app);

/*
====================================================
Middlewares
====================================================
*/

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/*
====================================================
Database
====================================================
*/

async function connectDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    logger.info('MongoDB Connected Successfully');
  } catch (error) {
    logger.error('MongoDB Connection Failed', {
      error: error.message,
    });

    process.exit(1);
  }
}

connectDatabase();

/*
====================================================
Health Check
====================================================
*/

app.get('/api/healthcheck', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'HealthSphere Backend Running 🚀',
  });
});

/*
====================================================
Routes
====================================================
*/

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/chat', newChatRoutes);
app.use('/api/legacy-chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
/*
====================================================
Socket.IO
====================================================
*/

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

registerChatSocket(io);
registerNotificationSocket(io);

/*
====================================================
Error Handler
====================================================
*/

app.use(errorHandler);

/*
====================================================
Server
====================================================
*/

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  logger.info('Server Started Successfully', {
    port: PORT,
  });
});

/*
====================================================
Graceful Shutdown
====================================================
*/

process.on('SIGINT', async () => {
  logger.info('Shutting down server...');

  await mongoose.connection.close();

  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Server terminated.');

  await mongoose.connection.close();

  process.exit(0);
});

/*
====================================================
Unhandled Promise Rejections
====================================================
*/

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', {
    error: reason,
  });
});

/*
====================================================
Uncaught Exceptions
====================================================
*/

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });

  process.exit(1);
});

module.exports = app;
