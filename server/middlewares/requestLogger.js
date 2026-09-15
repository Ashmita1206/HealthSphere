const crypto = require('crypto');
const logger = require('../utils/logger');

let metricsRegistry = null;
try {
  metricsRegistry = require('../utils/metrics').metricsRegistry;
} catch (_e) {}

let metricsService = null;
try {
  metricsService = require('../services/metricsService');
} catch (_e) {}

/**
 * HealthSphere Request Correlation, Logging & Observability Middleware
 */
function requestLogger(req, res, next) {
  const incomingId = req.headers ? (req.headers['x-request-id'] || req.headers['x-correlation-id']) : null;
  const requestId = (typeof incomingId === 'string' && incomingId.trim().length > 0)
    ? incomingId.trim()
    : (crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  req.id = requestId;
  req.requestId = requestId;

  if (typeof res.setHeader === 'function') {
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('x-request-id', requestId);
  }

  const startHr = process.hrtime();

  res.on('finish', () => {
    const diffHr = process.hrtime(startHr);
    const durationMs = Number(((diffHr[0] * 1e3) + (diffHr[1] * 1e-6)).toFixed(2));
    const statusCode = res.statusCode || 200;
    const method = req.method || 'GET';
    const url = req.originalUrl || req.url || req.path || '/';
    const sanitizedUrl = url.split('?')[0];

    // Set response time header if not already sent
    try {
      if (!res.headersSent && typeof res.setHeader === 'function') {
        res.setHeader('X-Response-Time', `${durationMs}ms`);
      }
    } catch (_err) {}

    // Record metrics in registry and metricsService
    if (metricsRegistry && typeof metricsRegistry.recordHttpRequest === 'function') {
      metricsRegistry.recordHttpRequest(method, sanitizedUrl, statusCode, durationMs);
    }
    if (metricsService && typeof metricsService.recordRequest === 'function') {
      metricsService.recordRequest(statusCode, durationMs);
    }

    const isHealthPoll = url.includes('/health') || url.includes('/live') || url.includes('/ready');
    const logData = {
      requestId,
      method,
      url,
      path: url,
      statusCode,
      durationMs,
      ip: req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1',
      userAgent: (req.headers && req.headers['user-agent']) || 'Unknown',
      userId: req.user ? (req.user._id || req.user.id || 'anonymous') : 'anonymous',
    };

    if (statusCode >= 500) {
      logger.error('HTTP 5xx Server Error', logData);
    } else if (statusCode >= 400) {
      logger.warn('HTTP 4xx Client Warning', logData);
    } else if (!isHealthPoll) {
      logger.info('HTTP Request Completed', logData);
    }
  });

  next();
}

module.exports = {
  requestLogger,
  requestLoggerMiddleware: requestLogger,
};
