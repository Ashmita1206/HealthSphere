/**
 * HealthSphere Enterprise Redis Performance & Caching Layer
 * Provides high-throughput caching, TTL management, automated invalidation,
 * and dedicated domain sub-caches (Session, AI, Dashboard, Analytics, Notification).
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

class CacheItem {
  constructor(key, value, ttlSeconds) {
    this.key = key;
    this.value = value;
    this.expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  }

  isExpired() {
    return this.expiresAt !== null && Date.now() > this.expiresAt;
  }
}

class RedisCacheService {
  constructor(maxMemoryItems = 2000) {
    this.maxMemoryItems = maxMemoryItems;
    this.memoryStore = new Map();
    this.hits = 0;
    this.misses = 0;
    this.isRedisReady = false;
    this.redisClient = null;

    // Optional Redis initialization if REDIS_URL is provided
    if (process.env.REDIS_URL) {
      try {
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

        this.redisClient.on('error', (_err) => {
          this.isRedisReady = false;
        });

        this.redisClient.connect().catch(() => {
          this.isRedisReady = false;
        });
      } catch (_e) {
        this.isRedisReady = false;
      }
    }

    // Initialize domain-specific sub-caches
    this.session = this._createSubCache('session', 3600); // 1 hour TTL
    this.ai = this._createSubCache('ai', 86400); // 24 hours TTL
    this.dashboard = this._createSubCache('dashboard', 300); // 5 minutes TTL
    this.analytics = this._createSubCache('analytics', 600); // 10 minutes TTL
    this.notification = this._createSubCache('notification', 180); // 3 minutes TTL
  }

  /**
   * Helper factory to create domain namespaces with TTL and invalidation
   */
  _createSubCache(namespace, defaultTtlSeconds) {
    return {
      get: async (key) => this.get(`${namespace}:${key}`),
      set: async (key, value, ttl = defaultTtlSeconds) => this.set(`${namespace}:${key}`, value, ttl),
      del: async (key) => this.del(`${namespace}:${key}`),
      has: async (key) => this.has(`${namespace}:${key}`),
      invalidate: async (key) => this.del(`${namespace}:${key}`),
      invalidateAll: async () => this.invalidatePattern(`${namespace}:*`),
    };
  }

  /**
   * Get raw key
   */
  async get(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          this.hits += 1;
          return JSON.parse(raw);
        }
        this.misses += 1;
        return null;
      } catch (_err) {
        // Fall back to memory store on redis read error
      }
    }

    // In-memory fallback
    const item = this.memoryStore.get(key);
    if (!item) {
      this.misses += 1;
      return null;
    }

    if (item.isExpired()) {
      this.memoryStore.delete(key);
      this.misses += 1;
      return null;
    }

    // Refresh LRU order
    this.memoryStore.delete(key);
    this.memoryStore.set(key, item);
    this.hits += 1;
    return item.value;
  }

  /**
   * Set raw key with TTL
   */
  async set(key, value, ttlSeconds = 300) {
    if (this.isRedisReady && this.redisClient) {
      try {
        const payload = JSON.stringify(value);
        if (ttlSeconds) {
          await this.redisClient.set(key, payload, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, payload);
        }
        return true;
      } catch (_err) {
        // Fall back to memory
      }
    }

    // In-memory LRU eviction
    if (this.memoryStore.size >= this.maxMemoryItems) {
      const oldest = this.memoryStore.keys().next().value;
      if (oldest) this.memoryStore.delete(oldest);
    }

    const item = new CacheItem(key, value, ttlSeconds);
    this.memoryStore.set(key, item);
    return true;
  }

  /**
   * Delete key
   */
  async del(key) {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (_e) {
        // Ignore
      }
    }
    return this.memoryStore.delete(key);
  }

  /**
   * Pattern-based invalidation
   */
  async invalidatePattern(pattern) {
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let evictedCount = 0;

    // Invalidate from memory
    for (const k of this.memoryStore.keys()) {
      if (regexPattern.test(k)) {
        this.memoryStore.delete(k);
        evictedCount++;
      }
    }

    // Invalidate from Redis if connected
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

    return evictedCount;
  }

  /**
   * Check existence
   */
  async has(key) {
    const val = await this.get(key);
    return val !== null;
  }

  /**
   * Flush all
   */
  async flush() {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (_e) {
        // Ignore
      }
    }
    this.memoryStore.clear();
    this.hits = 0;
    this.misses = 0;
    return true;
  }

  /**
   * Performance Metrics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.memoryStore.size,
      maxItems: this.maxMemoryItems,
      hits: this.hits,
      misses: this.misses,
      hitRatioPct: total > 0 ? Number(((this.hits / total) * 100).toFixed(2)) : 0,
      isRedisReady: this.isRedisReady,
    };
  }
}

const cacheService = new RedisCacheService();

module.exports = cacheService;
