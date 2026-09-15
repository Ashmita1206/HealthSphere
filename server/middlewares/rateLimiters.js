const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter: 1000 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Global API rate limit exceeded. Please throttle your requests.',
    },
  },
});

/**
 * Authentication rate limiter: 20 requests per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

/**
 * Sensitive operations rate limiter (password reset, email verification): 15 per 15 minutes
 */
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'SENSITIVE_OP_LIMIT_EXCEEDED',
      message: 'Too many sensitive operations requested. Please try again later.',
    },
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
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI inference rate limit exceeded. Please wait a minute before querying again.',
    },
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
    error: {
      code: 'CHAT_LIMIT_EXCEEDED',
      message: 'Chat message rate limit exceeded. Please wait a moment before sending more messages.',
    },
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
    error: {
      code: 'EMERGENCY_LIMIT_EXCEEDED',
      message: 'Emergency rate threshold reached.',
    },
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  sensitiveLimiter,
  aiLimiter,
  chatLimiter,
  emergencyLimiter,
};
