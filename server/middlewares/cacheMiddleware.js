const { cacheService } = require('../services/cacheService');

/**
 * Route level caching middleware for Express
 * @param {Object} options
 * @param {number} options.ttl - TTL in seconds (default: 60)
 * @param {Function} [options.keyGenerator] - Custom cache key generator (req) => string
 */
function cacheMiddleware(options = {}) {
  const ttl = options.ttl || 60;
  const keyGenerator = options.keyGenerator || ((req) => {
    const userScope = req.user ? `user:${req.user._id || req.user.id}` : 'anon';
    return `http-cache:${userScope}:${req.originalUrl || req.url}`;
  });

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = keyGenerator(req);
    try {
      const cached = await cacheService.get(key);
      if (cached) {
        res.setHeader('x-cache', 'HIT');
        return res.json(cached);
      }

      res.setHeader('x-cache', 'MISS');

      // Intercept res.json to capture response payload
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(key, body, ttl).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (_err) {
      next();
    }
  };
}

module.exports = { cacheMiddleware };
