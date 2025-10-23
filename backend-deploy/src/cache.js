/**
 * Simple in-memory cache stub
 * Provides cache interface without complex implementation
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.versions = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = 60000) {
    this.cache.set(key, value);
    // Auto-expire after TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
    return true;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
    this.versions.clear();
  }

  clearPattern(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  getVersion(key) {
    return this.versions.get(key) || 1;
  }

  incrementVersion(key) {
    const current = this.getVersion(key);
    this.versions.set(key, current + 1);
    return current + 1;
  }

  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  getKeys() {
    return Array.from(this.cache.keys());
  }
}

const cache = new SimpleCache();
module.exports = cache;





