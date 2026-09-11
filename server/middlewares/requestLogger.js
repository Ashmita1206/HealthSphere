/**
 * HealthSphere Request Correlation & Observability Middleware
 * Request ID tracking, high-resolution duration measurement, and structured access logging
 */

const crypto = require('crypto');
const logger = require('../utils/logger');
const metricsService = require('../services/metricsService');

function requestLogger(req, res, next) {
  // Extract or generate unique Request Correlation ID
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId = incomingId || (crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  // High resolution start time
  const startHr = process.hrtime();
  const startTime = Date.now();

  res.on('finish', () => {
    const diffHr = process.hrtime(startHr);
    const durationMs = Number(((diffHr[0] * 1e3) + (diffHr[1] * 1e-6)).toFixed(2));

    // Record in metrics aggregator
    metricsService.recordRequest(res.statusCode, durationMs);

    // Set response header if headers not yet sent
    try {
      if (!res.headersSent) {
        res.setHeader('X-Response-Time', `${durationMs}ms`);
      }
    } catch (_err) {
      // Ignored if already flushed
    }

    // Skip excessively noisy polling endpoints in normal logs
    const isHealthPoll = req.path.includes('/health') || req.path.includes('/live') || req.path.includes('/ready');

    if (!isHealthPoll || res.statusCode >= 400) {
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

      logger[level]('HTTP Request', {
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        userId: req.user?._id || req.user?.id || 'anonymous',
      });
    }
  });

  next();
}

module.exports = { requestLogger };
