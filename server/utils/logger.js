const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

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

module.exports = logger;
