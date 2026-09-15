const logger = require('../utils/logger');
const { metricsRegistry } = require('../utils/metrics');

/**
 * Enterprise Request Logging Middleware
 * Outputs structured JSON logs for all HTTP activity and feeds Prometheus metrics.
 */
function requestLoggerMiddleware(req, res, next) {
  const start = process.hrtime();
  const requestId = req.id || req.headers['x-request-id'] || 'unknown';

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = Number((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const sanitizedUrl = url.split('?')[0]; // Remove query params from metric labels to avoid high cardinality

    // Record metrics
    metricsRegistry.recordHttpRequest(method, sanitizedUrl, statusCode, durationMs);

    // Filter out excessive noise for static or internal polling if necessary
    const logData = {
      requestId,
      method,
      url,
      statusCode,
      durationMs,
      ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
    };

    if (statusCode >= 500) {
      logger.error('HTTP 5xx Server Error', logData);
    } else if (statusCode >= 400) {
      logger.warn('HTTP 4xx Client Warning', logData);
    } else {
      logger.info('HTTP Request Completed', logData);
    }
  });

  next();
}

module.exports = { requestLoggerMiddleware };
