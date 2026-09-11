require('dotenv').config();

const { validateEnvironment } = require('./config/envValidator');
const { featureFlags } = require('./config/featureFlags');

// Validate environment secrets and configuration
validateEnvironment();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const {
  requestIdMiddleware,
  mongoSanitize,
  xssProtection,
  configureCors,
  apiErrorFormatter,
} = require('./middlewares/security');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiters');
const { compressionMiddleware } = require('./middlewares/compression');
const { requestLoggerMiddleware } = require('./middlewares/requestLogger');

// Routes
const monitoringRoutes = require('./routes/monitoringRoutes');
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
const cdssRoutes = require('./routes/cdssRoutes');
const medicalImagingRoutes = require('./routes/medicalImagingRoutes');
const hospitalResourceRoutes = require('./routes/hospitalResourceRoutes');
const populationIntelligenceRoutes = require('./routes/populationIntelligenceRoutes');
const smartPharmacyRoutes = require('./routes/smartPharmacyRoutes');
const labInformationRoutes = require('./routes/labInformationRoutes');

// Socket
const registerChatSocket = require('./sockets/chat.socket');
const registerNotificationSocket = require('./sockets/notification.socket');
const registerCollaborationSocket = require('./sockets/collaboration.socket');
const { registerRealtimeInfrastructureSocket } = require('./sockets/realtimeInfrastructure.socket');
const { setIO } = require('./services/realtimeService');

const app = express();
const httpServer = createServer(app);

/*
====================================================
Middlewares & Security Layer
====================================================
*/

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(compressionMiddleware());
app.use(monitoringRoutes);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors(configureCors()));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);
app.use(xssProtection);

// Global & Auth Rate Limiters
app.use('/api', apiLimiter);
app.use('/api/v1', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/v1/auth', authLimiter);

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

const healthHandler = (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'HealthSphere Backend Running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/healthcheck', healthHandler);
app.get('/api/v1/healthcheck', healthHandler);

const featureHandler = (_req, res) => {
  res.status(200).json({
    success: true,
    features: featureFlags.getAllFlags(),
  });
};

app.get('/api/features', featureHandler);
app.get('/api/v1/features', featureHandler);

/*
====================================================
Routes (API v1 & Legacy Prefix Aliasing)
====================================================
*/

const apiPrefixes = ['/api', '/api/v1'];

apiPrefixes.forEach((prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/user`, userRoutes);
  app.use(`${prefix}/health`, healthRoutes);
  app.use(`${prefix}/reminders`, reminderRoutes);
  app.use(`${prefix}/reports`, reportRoutes);
  app.use(`${prefix}/emergency`, emergencyRoutes);
  app.use(`${prefix}/chat`, newChatRoutes);
  app.use(`${prefix}/legacy-chat`, chatRoutes);
  app.use(`${prefix}/ai`, aiRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/timeline`, timelineRoutes);
  app.use(`${prefix}/analytics`, analyticsRoutes);
  app.use(`${prefix}/profile/medical`, medicalProfileRoutes);
  app.use(`${prefix}/medical-profile`, medicalProfileRoutes);
  app.use(`${prefix}/doctors`, doctorRoutes);
  app.use(`${prefix}/records`, recordShareRoutes);
  app.use(`${prefix}/consultations`, consultationRoutes);
  app.use(`${prefix}/ai`, symptomRoutes);
  app.use(`${prefix}/dashboard`, dashboardRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/wearables`, wearableRoutes);
  app.use(`${prefix}/workflows`, workflowRoutes);
  app.use(`${prefix}/assistant`, assistantRoutes);
  app.use(`${prefix}/cdss`, cdssRoutes);
  app.use(`${prefix}/imaging`, medicalImagingRoutes);
  app.use(`${prefix}/resources`, hospitalResourceRoutes);
  app.use(`${prefix}/population`, populationIntelligenceRoutes);
  app.use(`${prefix}/pharmacy`, smartPharmacyRoutes);
  app.use(`${prefix}/lab`, labInformationRoutes);
});
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
registerRealtimeInfrastructureSocket(io);
setIO(io);

/*
====================================================
Error Handler
====================================================
*/

app.use(apiErrorFormatter);

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
