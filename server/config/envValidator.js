/**
 * HealthSphere Enterprise Environment Profiles & Secrets Validator
 */
const logger = require('../utils/logger');

const ENVIRONMENT_PROFILES = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

const REQUIRED_PRODUCTION_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL',
];

function validateEnvironment() {
  const env = (process.env.NODE_ENV || ENVIRONMENT_PROFILES.DEVELOPMENT).toLowerCase();
  const errors = [];
  const warnings = [];

  if (env === ENVIRONMENT_PROFILES.PRODUCTION) {
    for (const varName of REQUIRED_PRODUCTION_VARS) {
      if (!process.env[varName] || process.env[varName].trim().length === 0) {
        errors.push(`Missing mandatory production variable: ${varName}`);
      }
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      errors.push('Security Violation: JWT_SECRET must be at least 32 characters long in production');
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('dev_only')) {
      errors.push('Security Violation: Insecure default development JWT_SECRET used in production');
    }
  } else {
    // Development fallbacks and warnings
    if (!process.env.JWT_SECRET) {
      warnings.push('JWT_SECRET not set; falling back to internal development secret');
    }
    if (!process.env.MONGODB_URI) {
      warnings.push('MONGODB_URI not set; using local development mongodb://localhost:27017/healthsphere');
    }
  }

  if (warnings.length > 0) {
    warnings.forEach((w) => logger.warn(`[Config Warning] ${w}`));
  }

  if (errors.length > 0) {
    errors.forEach((e) => logger.error(`[Config Fatal] ${e}`));
    if (env === ENVIRONMENT_PROFILES.PRODUCTION) {
      throw new Error(`Production environment validation failed:\n${errors.join('\n')}`);
    }
  }

  return {
    valid: errors.length === 0,
    environment: env,
    errors,
    warnings,
  };
}

module.exports = {
  ENVIRONMENT_PROFILES,
  validateEnvironment,
};
