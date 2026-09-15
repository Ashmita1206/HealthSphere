/**
 * HealthSphere API Response Caching Middleware
 * Automatically caches idempotent GET requests and attaches X-Cache header
 */

const defaultCacheService = require('../services/cacheService');

function createCacheHandler(options = {}) {
  const ttl = typeof options === 'number' ? options : (options.ttl || 60);
  const keyGenerator = (typeof options === 'object' && options.keyGenerator) || ((req) => {
    const userScope = req.user ? `user:${req.user._id || req.user.id}` : 'anon';
    const queryStr = req.query ? JSON.stringify(req.query) : '';
    const path = req.baseUrl ? `${req.baseUrl}${req.path}` : (req.originalUrl || req.url || req.path);
    return `http-cache:${userScope}:${path}:${queryStr}`;
  });

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Bypass cache if client explicitly requests no-cache
    if (req.headers && req.headers['cache-control'] === 'no-cache') {
      if (typeof res.setHeader === 'function') {
        res.setHeader('X-Cache', 'BYPASS');
        res.setHeader('x-cache', 'BYPASS');
      }
      return next();
    }

    const key = keyGenerator(req);

    try {
      const cached = await defaultCacheService.get(key);
      if (cached !== null && cached !== undefined) {
        if (typeof res.setHeader === 'function') {
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('x-cache', 'HIT');
        }
        if (typeof res.status === 'function') {
          return res.status(200).json(cached);
        }
        return res.json(cached);
      }

      if (typeof res.setHeader === 'function') {
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('x-cache', 'MISS');
      }

      // Intercept res.json to capture response payload
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode === undefined || (res.statusCode >= 200 && res.statusCode < 300)) {
          defaultCacheService.set(key, body, ttl).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (_err) {
      next();
    }
  };
}

function cacheResponse(ttlSeconds = 60) {
  return createCacheHandler(ttlSeconds);
}

function cacheMiddleware(options = {}) {
  return createCacheHandler(options);
}

module.exports = {
  cacheResponse,
  cacheMiddleware,
};
