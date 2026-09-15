const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');

// Ensure logs directory exists
const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (_e) {
    // Fallback if read-only filesystem
  }
}

const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.json(),
);

const logTransports = [
  new transports.Console({
    format: process.env.NODE_ENV === 'production'
      ? customFormat
      : format.combine(
          format.colorize(),
          format.timestamp({ format: 'HH:mm:ss' }),
          format.printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
            const req = requestId ? ` [${requestId}]` : '';
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} ${level}${req}: ${message}${metaStr}${stack ? `\n${stack}` : ''}`;
          }),
        ),
  }),
];

// Add file transports if writeable
try {
  logTransports.push(
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logDir, 'app.log'),
      format: customFormat,
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 5,
    }),
  );
} catch (_err) {
  // Console logger fallback
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'healthsphere-ai-backend' },
  transports: logTransports,
});

/**
 * Central Error Tracking Utility
 * Standardizes incident reporting and stack trace preservation
 */
logger.trackError = function trackError(err, context = {}) {
  const errorObj = {
    name: err.name || 'Error',
    message: err.message || String(err),
    stack: err.stack,
    context,
    timestamp: new Date().toISOString(),
  };
  logger.error(`[ErrorTracker] ${errorObj.name}: ${errorObj.message}`, errorObj);
  return errorObj;
};

/**
 * Morgan HTTP stream integration
 */
morgan.token('req-id', (req) => req.requestId || req.id || req.headers['x-request-id'] || '-');
const morganMiddleware = morgan(
  ':req-id :method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => (logger.http ? logger.http(message.trim()) : logger.info(message.trim())),
    },
    skip: (req) => {
      // Don't flood logs with high-frequency health probes in production
      return req.path === '/api/healthcheck' || req.path === '/api/system/liveness' || req.path === '/health/liveness';
    },
  },
);

module.exports = logger;
module.exports.morganMiddleware = morganMiddleware;
