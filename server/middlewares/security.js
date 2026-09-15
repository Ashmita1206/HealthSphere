const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Request ID Middleware
 * Assigns or propagates a unique UUID x-request-id for end-to-end tracing.
 */
function requestIdMiddleware(req, res, next) {
  const existingId = req.headers ? (req.headers['x-request-id'] || req.headers['x-correlation-id']) : null;
  const requestId = (typeof existingId === 'string' && existingId.trim().length > 0)
    ? existingId.trim()
    : (crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  req.id = requestId;
  req.requestId = requestId;
  if (typeof res.setHeader === 'function') {
    res.setHeader('x-request-id', requestId);
    res.setHeader('X-Request-Id', requestId);
  }
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
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeMongoPayload(value);
  }
  return sanitized;
}

const sanitizeObject = sanitizeMongoPayload;

/**
 * Mongo Sanitization Middleware
 */
function mongoSanitize(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeMongoPayload(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    try {
      req.query = sanitizeMongoPayload(req.query);
    } catch (_err) {
      for (const k of Object.keys(req.query)) {
        if (k.startsWith('$') || k.includes('.')) {
          delete req.query[k];
        }
      }
    }
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
    .replace(/javascript\s*:/gi, '')
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

const sanitizeStringsDeep = sanitizeXssPayload;

/**
 * XSS Protection Middleware
 */
function xssProtection(req, _res, next) {
  if (req.body) req.body = sanitizeXssPayload(req.body);
  if (req.query) req.query = sanitizeXssPayload(req.query);
  if (req.params) req.params = sanitizeXssPayload(req.params);
  next();
}

const xssSanitize = xssProtection;

/**
 * Security headers middleware augmenting standard Helmet
 */
function securityHeaders(req, res, next) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');
  }
  next();
}

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates CSRF token against cookie or session
 */
function verifyCsrfToken(cookieToken, headerToken) {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  } catch (_e) {
    return false;
  }
}

/**
 * Express middleware for CSRF protection
 */
function csrfProtection(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  // Set CSRF cookie for safe requests if not present
  if (safeMethods.includes(req.method)) {
    if (!req.cookies || !req.cookies['csrf_token']) {
      const newToken = generateCsrfToken();
      if (typeof res.cookie === 'function') {
        res.cookie('csrf_token', newToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
        });
      }
      if (typeof res.setHeader === 'function') {
        res.setHeader('X-CSRF-Token', newToken);
      }
    }
    return next();
  }

  // Bearer token requests are immune to CSRF
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  const cookieToken = req.cookies ? req.cookies['csrf_token'] : null;
  const headerToken = req.headers ? (req.headers['x-csrf-token'] || req.headers['csrf-token']) : null;

  if (!cookieToken || !headerToken || !verifyCsrfToken(cookieToken, headerToken)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: missing or invalid CSRF token',
    });
  }

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
      const details = error.details ? error.details.map((d) => d.message) : [error.message];
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
    ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4000',
        'http://localhost:80',
        'http://localhost',
      ];

  return {
    origin: (origin, callback) => {
      // Allow non-browser calls (e.g. mobile, server-to-server)
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
      'X-Requested-With',
      'X-Request-Id',
      'x-request-id',
      'x-api-version',
      'x-refresh-token',
      'x-emergency-token',
      'Accept',
    ],
    exposedHeaders: [
      'X-Request-Id',
      'x-request-id',
      'X-Response-Time',
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
  const requestId = req.id || (req.headers && req.headers['x-request-id']) || 'system';

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
  sanitizeObject,
  sanitizeMongoPayload,
  xssProtection,
  xssSanitize,
  sanitizeString,
  sanitizeStringsDeep,
  sanitizeXssPayload,
  securityHeaders,
  generateCsrfToken,
  verifyCsrfToken,
  csrfProtection,
  validateRequest,
  configureCors,
  apiErrorFormatter,
};
