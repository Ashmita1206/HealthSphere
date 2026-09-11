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

module.exports = {
  sanitizeObject,
  sanitizeString,
  mongoSanitize,
  xssSanitize,
  securityHeaders,
};
