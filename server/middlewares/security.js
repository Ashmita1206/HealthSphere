const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Request ID Middleware
 * Assigns or propagates a unique UUID x-request-id for end-to-end tracing.
 */
function requestIdMiddleware(req, res, next) {
  const existingId = req.headers['x-request-id'];
  const requestId = (typeof existingId === 'string' && existingId.trim().length > 0)
    ? existingId.trim()
    : crypto.randomUUID();

  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

/**
 * Recursive sanitizer for MongoDB injection ($ operators and dotted keys)
 */
function sanitizeMongoPayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoPayload);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip operators starting with $ or containing a dot
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeMongoPayload(value);
  }
  return sanitized;
}

/**
 * Mongo Sanitization Middleware
 */
function mongoSanitize(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeMongoPayload(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeMongoPayload(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeMongoPayload(req.params);
  }
  next();
}

/**
 * Clean XSS dangerous markup from string inputs
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

function sanitizeXssPayload(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeXssPayload);
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [k, v] of Object.entries(obj)) {
      sanitized[k] = sanitizeXssPayload(v);
    }
    return sanitized;
  }
  return obj;
}

/**
 * XSS Protection Middleware
 */
function xssProtection(req, _res, next) {
  if (req.body) req.body = sanitizeXssPayload(req.body);
  if (req.query) req.query = sanitizeXssPayload(req.query);
  if (req.params) req.params = sanitizeXssPayload(req.params);
  next();
}

/**
 * Request Validation Middleware Generator
 */
function validateRequest(schema, source = 'body') {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') {
      return next();
    }

    const targetData = req[source] || {};
    const { error, value } = schema.validate(targetData, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details ? error.details.map(d => d.message) : [error.message];
      return res.status(400).json({
        success: false,
        message: 'Request validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request payload',
          details,
          requestId: req.id || 'unknown',
          timestamp: new Date().toISOString(),
        },
      });
    }

    req[source] = value;
    next();
  };
}

/**
 * Enhanced Enterprise CORS Configuration
 */
function configureCors() {
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4000'];

  return {
    origin: (origin, callback) => {
      // Allow non-browser calls (like curl, mobile native or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-request-id',
      'x-api-version',
      'x-refresh-token',
      'x-emergency-token',
    ],
    exposedHeaders: [
      'x-request-id',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
    ],
    maxAge: 86400, // 24 hours preflight cache
  };
}

/**
 * Standardized API Error Formatter Middleware
 */
function apiErrorFormatter(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const requestId = req.id || req.headers?.['x-request-id'] || 'system';

  logger.error('API Error Encountered', {
    status,
    requestId,
    url: req.originalUrl || req.url,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    error: {
      code: err.code || (status === 404 ? 'NOT_FOUND' : status === 400 ? 'BAD_REQUEST' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR'),
      message: err.message || 'Internal server error',
      details: err.details || (process.env.NODE_ENV === 'production' ? null : err.stack),
      requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = {
  requestIdMiddleware,
  mongoSanitize,
  sanitizeMongoPayload,
  xssProtection,
  sanitizeString,
  sanitizeXssPayload,
  validateRequest,
  configureCors,
  apiErrorFormatter,
};
