/**
 * HealthSphere Enterprise Security Middlewares
 * Sanitization, NoSQL Injection Defense, and Security Headers
 */

/**
 * Deep sanitization function to strip MongoDB query operators ($gt, $ne, $where, etc.)
 * from request payloads to prevent NoSQL injection attacks.
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop keys starting with $ or containing a dot
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = typeof value === 'object' && value !== null ? sanitizeObject(value) : value;
  }
  return cleaned;
}

/**
 * Strips dangerous HTML / script tags from strings
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '');
}

function sanitizeStringsDeep(obj) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeStringsDeep(item));
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    cleaned[key] = sanitizeStringsDeep(value);
  }
  return cleaned;
}

/**
 * Express middleware for Mongo NoSQL Injection Prevention
 */
function mongoSanitize(req, _res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    try {
      req.query = sanitizeObject(req.query);
    } catch (_err) {
      // In Express 5 query might be getter-only; mutate keys directly
      for (const k of Object.keys(req.query)) {
        if (k.startsWith('$') || k.includes('.')) {
          delete req.query[k];
        }
      }
    }
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Express middleware for XSS sanitization
 */
function xssSanitize(req, _res, next) {
  if (req.body) {
    req.body = sanitizeStringsDeep(req.body);
  }
  next();
}

/**
 * Security headers middleware augmenting standard Helmet
 */
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');
  next();
}

const crypto = require('crypto');


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
      res.cookie('csrf_token', newToken, {
        httpOnly: false, // Accessible by frontend JavaScript for double-submit header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      res.setHeader('X-CSRF-Token', newToken);
    }
    return next();
  }

  // Bearer token requests (API calls) are immune to browser cross-site request forgery
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // Cookie-based state-changing requests require matching CSRF header
  const cookieToken = req.cookies ? req.cookies['csrf_token'] : null;
  const headerToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];

  if (!cookieToken || !headerToken || !verifyCsrfToken(cookieToken, headerToken)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed: missing or invalid CSRF token',
    });
  }

  next();
}

module.exports = {
  sanitizeObject,
  sanitizeString,
  mongoSanitize,
  xssSanitize,
  securityHeaders,
  generateCsrfToken,
  verifyCsrfToken,
  csrfProtection,
};

