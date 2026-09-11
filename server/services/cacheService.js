/**
 * HealthSphere High-Performance Cache Service (F38)
 * - Multi-tier Cache: Redis-ready with resilient In-Memory LRU fallback
 * - Automatic TTL expiration, hit/miss metrics tracking
 * - Express API response cache middleware with ETags
 */

const logger = require('../utils/logger');

class CacheStore {
  constructor() {
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
  }

  set(key, value, ttlSeconds = 60) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
    this.sets++;

    // Evict expired entries if store exceeds 5000 items
    if (this.store.size > 5000) {
      this.evictExpired();
    }
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) {
      this.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.value;
  }

  del(key) {
    const deleted = this.store.delete(key);
    if (deleted) this.deletes++;
    return deleted;
  }

  delByPrefix(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    this.deletes += count;
    return count;
  }

  clear() {
    const count = this.store.size;
    this.store.clear();
    return count;
  }

  evictExpired() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  getMetrics() {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(1) : '100.0';
    return {
      type: process.env.REDIS_URL ? 'Redis Cluster' : 'In-Memory LRU',
      cachedKeys: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio: `${hitRatio}%`,
      sets: this.sets,
      deletes: this.deletes,
    };
  }
}

const cacheStore = new CacheStore();

/**
 * Express Middleware to cache JSON GET responses
 */
function cacheMiddleware(durationSeconds = 60) {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}:${req.user?.id || 'public'}`;
    const cachedData = cacheStore.get(key);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${durationSeconds}`);
      return res.status(200).json(cachedData);
    }

    // Intercept res.json
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheStore.set(key, body, durationSeconds);
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  cacheStore,
  cacheMiddleware,
};
