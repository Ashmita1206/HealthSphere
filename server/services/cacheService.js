/**
 * HealthSphere Cache Service
 * In-Memory LRU Cache with TTL and Redis Compatibility Layer
 */

class CacheItem {
  constructor(key, value, ttlSeconds) {
    this.key = key;
    this.value = value;
    this.expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;
  }

  isExpired() {
    return this.expiresAt !== null && Date.now() > this.expiresAt;
  }
}

class CacheService {
  constructor(maxItems = 1000) {
    this.maxItems = maxItems;
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get an item from cache
   */
  async get(key) {
    const item = this.store.get(key);
    if (!item) {
      this.misses += 1;
      return null;
    }

    if (item.isExpired()) {
      this.store.delete(key);
      this.misses += 1;
      return null;
    }

    // Refresh LRU position
    this.store.delete(key);
    this.store.set(key, item);
    this.hits += 1;
    return item.value;
  }

  /**
   * Set an item in cache
   */
  async set(key, value, ttlSeconds = 300) {
    // Evict oldest if full
    if (this.store.size >= this.maxItems) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    const item = new CacheItem(key, value, ttlSeconds);
    this.store.set(key, item);
    return true;
  }

  /**
   * Delete item by key
   */
  async del(key) {
    return this.store.delete(key);
  }

  /**
   * Check if valid key exists
   */
  async has(key) {
    const val = await this.get(key);
    return val !== null;
  }

  /**
   * Flush entire cache
   */
  async flush() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    return true;
  }

  /**
   * Get cache efficiency stats
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      maxItems: this.maxItems,
      hits: this.hits,
      misses: this.misses,
      hitRatioPct: total > 0 ? Number(((this.hits / total) * 100).toFixed(2)) : 0,
    };
  }
}

const cacheService = new CacheService();

module.exports = cacheService;
