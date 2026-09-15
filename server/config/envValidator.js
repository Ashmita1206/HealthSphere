/**
 * HealthSphere Enterprise Environment Profiles & Secrets Validator
 * Validates critical environment variables, security constraints, and service endpoints
 */

const logger = require('../utils/logger');

const ENVIRONMENT_PROFILES = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

const INSECURE_SECRET_PATTERNS = [
  'dev-secret',
  'test',
  '123456',
  'secret',
  'password',
  'healthsphere_dev',
  'replace-in-env',
  'dev_only',
];

const REQUIRED_PRODUCTION_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL',
];

function validateEnvironment(customEnv) {
  const env = customEnv || process.env;
  const nodeEnv = (env.NODE_ENV || ENVIRONMENT_PROFILES.DEVELOPMENT).toLowerCase();
  const isProd = nodeEnv === ENVIRONMENT_PROFILES.PRODUCTION;
  const errors = [];
  const warnings = [];

  // 1. Port Validation
  const port = parseInt(env.PORT || '4000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT specified: "${env.PORT}". Must be integer between 1 and 65535.`);
  }

  // 2. MongoDB URI Validation
  if (!env.MONGODB_URI) {
    if (isProd) {
      errors.push('Missing mandatory production variable: MONGODB_URI');
    } else {
      warnings.push('MONGODB_URI not set; using local development mongodb://localhost:27017/healthsphere');
    }
  } else if (!env.MONGODB_URI.startsWith('mongodb://') && !env.MONGODB_URI.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  }

  // 3. JWT Secret Validation
  const jwtSecret = env.JWT_SECRET || '';
  if (!jwtSecret) {
    if (isProd) {
      errors.push('Missing mandatory production variable: JWT_SECRET');
    } else {
      warnings.push('JWT_SECRET not set; falling back to internal development secret');
    }
  } else {
    if (isProd && jwtSecret.length < 32) {
      errors.push('Security Violation: JWT_SECRET must be at least 32 characters long in production');
    } else if (jwtSecret.length < 16) {
      warnings.push('JWT_SECRET is short (< 16 characters). Recommend 32+ characters in production.');
    }

    const isKnownInsecure = INSECURE_SECRET_PATTERNS.some((pattern) =>
      jwtSecret.toLowerCase().includes(pattern)
    );
    if (isKnownInsecure && isProd) {
      errors.push('Security Violation: Insecure default development JWT_SECRET used in production');
    }
  }

  // 4. Client URL Validation
  if (isProd && (!env.CLIENT_URL || env.CLIENT_URL.trim().length === 0)) {
    errors.push('Missing mandatory production variable: CLIENT_URL');
  }

  // Logging & fatal error throwing
  if (warnings.length > 0) {
    warnings.forEach((w) => {
      if (logger && typeof logger.warn === 'function') {
        logger.warn(`[Config Warning] ${w}`);
      }
    });
  }

  if (errors.length > 0) {
    errors.forEach((e) => {
      if (logger && typeof logger.error === 'function') {
        logger.error(`[Config Fatal] ${e}`);
      }
    });
    if (isProd && !customEnv) {
      throw new Error(`Production environment validation failed:\n${errors.join('\n')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    valid: errors.length === 0,
    environment: nodeEnv,
    errors,
    warnings,
    summary: {
      nodeEnv,
      port,
      databaseConfigured: Boolean(env.MONGODB_URI),
      redisConfigured: Boolean(env.REDIS_URL),
      aiConfigured: Boolean(env.GEMINI_API_KEY),
      storageConfigured: Boolean(env.CLOUDINARY_CLOUD_NAME),
    },
  };
}

module.exports = {
  validateEnvironment,
  ENVIRONMENT_PROFILES,
  INSECURE_SECRET_PATTERNS,
  REQUIRED_PRODUCTION_VARS,
};
