/**
 * HealthSphere API Response Caching Middleware
 * Automatically caches idempotent GET requests and attaches X-Cache header
 */

const cacheService = require('../services/cacheService');

/**
 * Cache middleware generator
 * @param {number} ttlSeconds Time to live in seconds (default: 60)
 */
function cacheResponse(ttlSeconds = 60) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Bypass cache if client explicitly passes no-cache
    if (req.headers['cache-control'] === 'no-cache') {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    const userId = req.user?._id || req.user?.id || 'anon';
    const cacheKey = `route:${req.baseUrl || ''}${req.path}:${userId}:${JSON.stringify(req.query || {})}`;

    try {
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData !== null) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cachedData);
      }

      res.setHeader('X-Cache', 'MISS');

      // Intercept res.json to store into cache before sending
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (_err) {
      // Graceful fallback to non-cached response on any cache error
      next();
    }
  };
}

module.exports = { cacheResponse };
