/**
 * HealthSphere High-Performance Multi-Tier Cache Service
 * Provides Redis caching with automatic in-memory fallback, TTL expiration, and telemetry.
 */

const logger = require('../utils/logger');

class MemoryStore {
  constructor(maxItems = 5000) {
    this.store = new Map();
    this.timers = new Map();
    this.maxItems = maxItems;
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) {
      this.misses += 1;
      return null;
    }

    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.delete(key);
      this.misses += 1;
      return null;
    }

    // Refresh LRU position
    this.store.delete(key);
    this.store.set(key, item);

    this.hits += 1;
    return item.value;
  }

  set(key, value, ttlSeconds = 300) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Immediate expiration if TTL is 0 or negative
    if (ttlSeconds !== undefined && ttlSeconds <= 0) {
      this.delete(key);
      return true;
    }

    // LRU eviction if maximum capacity reached
    if (this.store.size >= this.maxItems) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.delete(oldestKey);
    }

    const expiresAt = (ttlSeconds !== undefined && ttlSeconds > 0)
      ? Date.now() + ttlSeconds * 1000
      : null;

    this.store.set(key, { value, expiresAt });
    this.sets += 1;

    if (expiresAt) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttlSeconds * 1000);
      if (timer.unref) timer.unref();
      this.timers.set(key, timer);
    }

    return true;
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    const had = this.store.delete(key);
    if (had) this.deletes += 1;
    return had;
  }

  del(key) {
    return this.delete(key);
  }

  has(key) {
    const val = this.get(key);
    return val !== null;
  }

  flush() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    return true;
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    let count = 0;
    for (const key of Array.from(this.store.keys())) {
      if (regex.test(key)) {
        this.delete(key);
        count += 1;
      }
    }
    return count;
  }

  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 0 : Number((this.hits / total).toFixed(3));
    const hitRatioPct = total === 0 ? 0 : Number(((this.hits / total) * 100).toFixed(2));
    return {
      keysCount: this.store.size,
      size: this.store.size,
      maxItems: this.maxItems,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      hitRatioPct,
      sets: this.sets,
      deletes: this.deletes,
    };
  }
}

class CacheService {
  constructor(maxMemoryItems = 5000) {
    this.memory = new MemoryStore(maxMemoryItems);
    this.isRedisReady = false;
    this.redisClient = null;

    if (process.env.REDIS_URL) {
      try {
        const Redis = require('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
        });

        this.redisClient.on('connect', () => {
          this.isRedisReady = true;
          logger.info('Redis performance layer connected successfully');
        });

        this.redisClient.on('error', () => {
          this.isRedisReady = false;
        });

        this.redisClient.connect().catch(() => {
          this.isRedisReady = false;
        });
      } catch (_e) {
        this.isRedisReady = false;
      }
    }

    // Sub-caches for dedicated domain areas
    this.session = this._createSubCache('session', 3600);
    this.ai = this._createSubCache('ai', 86400);
    this.dashboard = this._createSubCache('dashboard', 300);
    this.analytics = this._createSubCache('analytics', 600);
    this.notification = this._createSubCache('notification', 180);
  }

  _createSubCache(namespace, defaultTtl) {
    return {
      get: async (key) => this.get(`${namespace}:${key}`),
      set: async (key, val, ttl = defaultTtl) => this.set(`${namespace}:${key}`, val, ttl),
      del: async (key) => this.del(`${namespace}:${key}`),
      has: async (key) => this.has(`${namespace}:${key}`),
      invalidate: async (key) => this.del(`${namespace}:${key}`),
      invalidateAll: async () => this.invalidatePattern(`${namespace}:*`),
    };
  }

  async get(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          this.memory.hits += 1;
          return JSON.parse(raw);
        }
        this.memory.misses += 1;
        return null;
      } catch (_err) {
        // Fallback to memory
      }
    }
    return this.memory.get(key);
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const payload = JSON.stringify(value);
        if (ttlSeconds && ttlSeconds > 0) {
          await this.redisClient.set(key, payload, 'EX', ttlSeconds);
        } else if (ttlSeconds <= 0) {
          await this.redisClient.del(key);
        } else {
          await this.redisClient.set(key, payload);
        }
      } catch (_err) {
        // Fallback to memory
      }
    }
    return this.memory.set(key, value, ttlSeconds);
  }

  async del(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (_e) {
        // Ignore
      }
    }
    return this.memory.delete(key);
  }

  async delete(key) {
    return this.del(key);
  }

  async has(key) {
    const val = await this.get(key);
    return val !== null;
  }

  async flush() {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (_e) {
        // Ignore
      }
    }
    return this.memory.flush();
  }

  async invalidatePattern(pattern) {
    let evictedCount = 0;
    if (this.isRedisReady && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
          evictedCount += keys.length;
        }
      } catch (_e) {
        // Ignore
      }
    }
    const memCount = this.memory.invalidatePattern(pattern);
    return evictedCount + memCount;
  }

  getStats() {
    const memStats = this.memory.getStats();
    return {
      backend: this.isRedisReady ? 'redis' : 'memory',
      isRedisReady: this.isRedisReady,
      ...memStats,
    };
  }
}

const defaultCacheService = new CacheService();

// Export default instance while providing named exports and attached properties
module.exports = defaultCacheService;
module.exports.cacheService = defaultCacheService;
module.exports.MemoryStore = MemoryStore;
module.exports.CacheService = CacheService;
