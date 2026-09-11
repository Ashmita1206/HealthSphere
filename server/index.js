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
const systemRoutes = require('./routes/systemRoutes');

// Observability & Tracing Middleware
const { requestLogger } = require('./middlewares/requestLogger');

// Socket
const registerChatSocket = require('./sockets/chat.socket');
const registerNotificationSocket = require('./sockets/notification.socket');
const registerCollaborationSocket = require('./sockets/collaboration.socket');
const { setIO } = require('./services/realtimeService');

const app = express();
const httpServer = createServer(app);

// Request Tracing, Compression, and Response Timing
app.use(requestLogger);
const { morganMiddleware } = require('./utils/logger');
app.use(morganMiddleware);
const { compressionMiddleware } = require('./middlewares/compression');
app.use(compressionMiddleware);


/*
====================================================
Middlewares & Security Hardening
====================================================
*/

const { mongoSanitize, xssSanitize, securityHeaders } = require('./middlewares/security');
const { apiLimiter } = require('./middlewares/rateLimiters');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(securityHeaders);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'http://localhost:4000',
        'http://localhost:80',
        'http://localhost:3000',
        'http://localhost',
      ].filter(Boolean);
      if (!origin || allowed.includes(origin) || allowed.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id', 'Accept'],
    exposedHeaders: ['X-Request-Id', 'X-Response-Time'],
  }),
);

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
app.use(xssSanitize);
app.use('/api/', apiLimiter);

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

// Register routes for both /api/ and /api/v1/ (API Versioning)
['/api', '/api/v1'].forEach((prefix) => {
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
});
app.use('/', systemRoutes);

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
  pingInterval: 25000,
  pingTimeout: 20000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6,
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
Graceful Shutdown & Fault Tolerance
====================================================
*/

let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new HTTP connections and drain active requests
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

  // Force termination if graceful drain exceeds 10 seconds
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
====================================================
Unhandled Promise Rejections & Uncaught Exceptions
====================================================
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

  // Fail fast on fatal uncaught exceptions
  process.exit(1);
});

module.exports = app;
