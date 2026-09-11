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
const timelineRoutes = require('./routes/timelineRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const medicalProfileRoutes = require('./routes/medicalProfileRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const recordShareRoutes = require('./routes/recordShareRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wearableRoutes = require('./routes/wearableRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const securityRoutes = require('./routes/securityRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const syncRoutes = require('./routes/syncRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const monitoringController = require('./controllers/monitoringController');
const monitoringService = require('./services/monitoringService');
const registerChatSocket = require('./sockets/chat.socket');
const registerNotificationSocket = require('./sockets/notification.socket');
const registerCollaborationSocket = require('./sockets/collaboration.socket');
const { setIO } = require('./services/realtimeService');

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
Health Probes & Prometheus Metrics (F39)
====================================================
*/

// Request duration & metrics interceptor
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    monitoringService.recordRequest(req.method, req.path, res.statusCode, Date.now() - start);
  });
  next();
});

app.get('/health', monitoringController.getHealth);
app.get('/health/liveness', monitoringController.getLiveness);
app.get('/health/readiness', monitoringController.getReadiness);
app.get('/metrics', monitoringController.getPrometheusMetrics);

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
app.use('/api/timeline', timelineRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile/medical', medicalProfileRoutes);
app.use('/api/medical-profile', medicalProfileRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/records', recordShareRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/ai', symptomRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wearables', wearableRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/monitoring', monitoringRoutes);
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
registerCollaborationSocket(io);
setIO(io);

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
