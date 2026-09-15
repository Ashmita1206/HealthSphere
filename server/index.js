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
const { morganMiddleware } = require('./utils/logger');
const {
  requestIdMiddleware,
  mongoSanitize,
  xssSanitize,
  xssProtection,
  securityHeaders,
  configureCors,
  apiErrorFormatter,
} = require('./middlewares/security');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiters');
const { compressionMiddleware } = require('./middlewares/compression');
const { requestLogger } = require('./middlewares/requestLogger');

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

const shareRoutes = require('./routes/shareRoutes');

// Socket

const recordShareRoutes = require('./routes/recordShareRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wearableRoutes = require('./routes/wearableRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const systemRoutes = require('./routes/systemRoutes');
const securityRoutes = require('./routes/securityRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const syncRoutes = require('./routes/syncRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const cdssRoutes = require('./routes/cdssRoutes');
const medicalImagingRoutes = require('./routes/medicalImagingRoutes');
const hospitalResourceRoutes = require('./routes/hospitalResourceRoutes');
const populationIntelligenceRoutes = require('./routes/populationIntelligenceRoutes');
const smartPharmacyRoutes = require('./routes/smartPharmacyRoutes');
const labInformationRoutes = require('./routes/labInformationRoutes');
const billingInsuranceRoutes = require('./routes/billingInsuranceRoutes');
const clinicalResearchRoutes = require('./routes/clinicalResearchRoutes');
const healthcareAutomationRoutes = require('./routes/healthcareAutomationRoutes');
const enterpriseCommandCenterRoutes = require('./routes/enterpriseCommandCenterRoutes');

// Controllers & Services
const monitoringController = require('./controllers/monitoringController');
const monitoringService = require('./services/monitoringService');

// Sockets

const registerChatSocket = require('./sockets/chat.socket');
const registerNotificationSocket = require('./sockets/notification.socket');
const registerCollaborationSocket = require('./sockets/collaboration.socket');
const { registerRealtimeInfrastructureSocket } = require('./sockets/realtimeInfrastructure.socket');
const { setIO } = require('./services/realtimeService');

const app = express();
const httpServer = createServer(app);

/*
===
Middlewares & Security Layer
===
*/

app.use(requestIdMiddleware);
app.use(requestLogger);
if (morganMiddleware) {
  app.use(morganMiddleware);
}
app.use(compressionMiddleware());
app.use(monitoringRoutes);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://*.tile.openstreetmap.org'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(securityHeaders);
app.use(cors(configureCors()));

// Lightweight native cookie parser for secure HTTP-only cookies
app.use((req, _res, next) => {
  req.cookies = req.cookies || {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0]?.trim();
      const val = parts.slice(1).join('=').trim();
      if (name) req.cookies[name] = decodeURIComponent(val);
    });
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);
app.use(xssSanitize || xssProtection);

// Global & Auth Rate Limiters
app.use('/api', apiLimiter);
app.use('/api/v1', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/v1/auth', authLimiter);

/*
===
Database Connection
===
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
===
Health Probes & Prometheus Metrics
===
*/

// Request duration & metrics interceptor
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (monitoringService && typeof monitoringService.recordRequest === 'function') {
      monitoringService.recordRequest(req.method, req.path, res.statusCode, Date.now() - start);
    }
  });
  next();
});

app.get('/health', monitoringController.getHealth);
app.get('/health/liveness', monitoringController.getLiveness);
app.get('/health/readiness', monitoringController.getReadiness);
app.get('/metrics', monitoringController.getPrometheusMetrics);

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
===
Routes (API v1 & Legacy Prefix Aliasing)
===
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
app.use('/api/share', shareRoutes);

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
  app.use(`${prefix}/system`, systemRoutes);
  app.use(`${prefix}/security`, securityRoutes);
  app.use(`${prefix}/collaboration`, collaborationRoutes);
  app.use(`${prefix}/sync`, syncRoutes);
  app.use(`${prefix}/performance`, performanceRoutes);
  app.use(`${prefix}/monitoring`, monitoringRoutes);
  app.use(`${prefix}/cdss`, cdssRoutes);
  app.use(`${prefix}/imaging`, medicalImagingRoutes);
  app.use(`${prefix}/resources`, hospitalResourceRoutes);
  app.use(`${prefix}/population`, populationIntelligenceRoutes);
  app.use(`${prefix}/pharmacy`, smartPharmacyRoutes);
  app.use(`${prefix}/lab`, labInformationRoutes);
  app.use(`${prefix}/billing`, billingInsuranceRoutes);
  app.use(`${prefix}/research`, clinicalResearchRoutes);
  app.use(`${prefix}/automation`, healthcareAutomationRoutes);
  app.use(`${prefix}/command-center`, enterpriseCommandCenterRoutes);
});

app.use('/', systemRoutes);


/*
===
Socket.IO
===
*/

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6,
});

registerChatSocket(io);
registerNotificationSocket(io);
registerCollaborationSocket(io);
registerRealtimeInfrastructureSocket(io);
setIO(io);

/*
===
Error Handler
===
*/

app.use(apiErrorFormatter);

/*
===
Server Initialization
===
*/

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  logger.info('Server Started Successfully', {
    port: PORT,
  });
});

/*
===
Graceful Shutdown & Fault Tolerance
===
*/

let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  httpServer.close(async (err) => {
    if (err) {
      logger.error('Error closing HTTP server', { error: err.message });
    } else {
      logger.info('HTTP server closed successfully.');
    }

    try {
      if (io) {
        io.close();
        logger.info('Socket.IO connections closed.');
      }

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed.');
      }

      process.exit(0);
    } catch (cleanupErr) {
      logger.error('Error during shutdown cleanup', { error: cleanupErr.message });
      process.exit(1);
    }
  });

  const forceTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out (10s threshold). Forcing immediate termination.');
    process.exit(1);
  }, 10000);

  if (forceTimeout.unref) {
    forceTimeout.unref();
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

/*
===
Unhandled Promise Rejections & Uncaught Exceptions
===
*/

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection Detected', {
    error: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception Detected - Server Terminating', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

module.exports = app;
