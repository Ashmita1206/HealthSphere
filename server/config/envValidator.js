/**
 * HealthSphere Production Environment Validator
 * Validates critical environment variables, security constraints, and service endpoints
 */

const INSECURE_SECRET_PATTERNS = [
  'dev-secret',
  'test',
  '123456',
  'secret',
  'password',
  'healthsphere_dev',
  'replace-in-env',
];

function validateEnvironment(env = process.env) {
  const errors = [];
  const warnings = [];

  const nodeEnv = env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';

  // 1. Port Validation
  const port = parseInt(env.PORT || '4000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`Invalid PORT specified: "${env.PORT}". Must be integer between 1 and 65535.`);
  }

  // 2. MongoDB URI Validation
  if (!env.MONGODB_URI) {
    errors.push('MONGODB_URI is required.');
  } else if (!env.MONGODB_URI.startsWith('mongodb://') && !env.MONGODB_URI.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  }

  // 3. JWT Secret Validation
  const jwtSecret = env.JWT_SECRET || '';
  if (!jwtSecret) {
    if (isProd) {
      errors.push('JWT_SECRET is strictly required in production.');
    } else {
      warnings.push('JWT_SECRET is unset; falling back to development default.');
    }
  } else {
    if (jwtSecret.length < 16) {
      warnings.push('JWT_SECRET is short (< 16 characters). Recommend 32+ characters in production.');
    }
    const isKnownInsecure = INSECURE_SECRET_PATTERNS.some((pattern) =>
      jwtSecret.toLowerCase().includes(pattern)
    );
    if (isKnownInsecure && isProd) {
      errors.push('JWT_SECRET contains known insecure development pattern in production environment.');
    }
  }

  // 4. Client URL Validation
  if (isProd && !env.CLIENT_URL) {
    warnings.push('CLIENT_URL is unset in production. CORS will default to localhost.');
  }

  return {
    isValid: errors.length === 0,
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
  INSECURE_SECRET_PATTERNS,
};
