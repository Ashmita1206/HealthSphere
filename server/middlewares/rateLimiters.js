const rateLimit = require('express-rate-limit');

/**
 * Authentication rate limiter: 15 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

/**
 * Global API rate limiter: 300 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'API rate limit exceeded. Please slow down your requests.',
  },
});

/**
 * AI clinical endpoints rate limiter: 30 requests per minute
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI inference rate limit exceeded. Please wait a minute before querying again.',
  },
});

/**
 * Real-time chat rate limiter: 60 requests per minute
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Chat message rate limit exceeded. Please wait a moment.',
  },
});

/**
 * Emergency SOS rate limiter: 120 per minute with high burst tolerance
 */
const emergencyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Emergency rate threshold reached.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
  aiLimiter,
  chatLimiter,
  emergencyLimiter,
};
