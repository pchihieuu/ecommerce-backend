"use strict";

const { getInstance } = require("../db/init.redis");

class RedisService {
  // Acquire lock with improved error handling
  static async acquireLock({ productId, quantity, cartId }) {
    const client = await getInstance();
    const key = `lockv2025_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; // 3 seconds

    for (let i = 0; i < retryTimes; i++) {
      try {
        // Atomically set lock with expiration using ioredis syntax
        const result = await client.set(
          key,
          JSON.stringify({ quantity, cartId }),
          'PX',
          expireTime,
          'NX'
        );

        if (result === "OK") {
          return key;
        }
      } catch (error) {
        console.error(`Lock attempt ${i + 1} failed:`, error);
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    return null;
  }

  // Release lock with error handling
  static async releaseLock(keyClock) {
    if (!keyClock) return;

    try {
      const client = await getInstance();
      await client.del(keyClock);
    } catch (error) {
      console.error("Failed to release lock:", error);
    }
  }

  // Additional utility methods
  static async set(key, value, options = {}) {
    const client = await getInstance();
    
    // Handle options for ioredis (syntax differs from node-redis)
    if (options.EX) {
      return client.set(key, value, 'EX', options.EX);
    } else if (options.PX) {
      return client.set(key, value, 'PX', options.PX);
    } else if (options.NX) {
      return client.set(key, value, 'NX');
    } else if (options.XX) {
      return client.set(key, value, 'XX');
    }
    
    return client.set(key, value);
  }

  static async get(key) {
    const client = await getInstance();
    return client.get(key);
  }

  static async del(key) {
    const client = await getInstance();
    return client.del(key);
  }
}

// Export methods with proper binding
module.exports = {
  acquireLock: RedisService.acquireLock.bind(RedisService),
  releaseLock: RedisService.releaseLock.bind(RedisService),
  set: RedisService.set.bind(RedisService),
  get: RedisService.get.bind(RedisService),
  del: RedisService.del.bind(RedisService),
};
