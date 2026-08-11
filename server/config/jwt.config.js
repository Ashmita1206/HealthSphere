function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production environment.');
    }
    return 'healthsphere_dev_only_secret_key_2026';
  }
  return secret;
}

module.exports = { getJwtSecret };
