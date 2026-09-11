const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Ensure log directory exists
const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (_e) {
    // Ignore error if unable to create directory in restricted env
  }
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'healthsphere-ai-backend' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] [${level}] [${service}]: ${message}${metaStr}`;
        })
      ),
    }),
    // Rotating daily/size-limited file transport for standard application logs
    new transports.File({
      filename: path.join(logDir, 'healthsphere-combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 5, // Keep 5 rotated archives
      tailable: true,
    }),
    // Rotating file transport dedicated to error tracking
    new transports.File({
      level: 'error',
      filename: path.join(logDir, 'healthsphere-error.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  ],
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
morgan.token('req-id', (req) => req.requestId || req.headers['x-request-id'] || '-');
const morganMiddleware = morgan(
  ':req-id :method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
    },
    skip: (req) => {
      // Don't flood logs with high-frequency health probes in production
      return req.path === '/api/healthcheck' || req.path === '/api/system/liveness';
    },
  }
);

module.exports = logger;
module.exports.morganMiddleware = morganMiddleware;
