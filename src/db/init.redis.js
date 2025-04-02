"use strict";

const Redis = require("ioredis");

class RedisInitializer {
  static instance = null;
  static client = null;

  static async getInstance() {
    if (!this.instance) {
      try {
        this.client = new Redis({
          host: process.env.REDIS_HOST || "localhost",
          port: process.env.REDIS_PORT || 6379,

          // Reconnection strategy
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            console.log(`Redis client attempting to reconnect in ${delay}ms`);
            return delay;
          },
          maxRetriesPerRequest: null,
        });

        // Error handling for client
        this.client.on("error", (err) => {
          console.error("Redis Client Error:", err);
        });

        // Connection success logging
        this.client.on("connect", () => {
          console.log("Redis client connected successfully");
        });

        // Implement reconnection event
        this.client.on("reconnecting", () => {
          console.log("Redis client attempting to reconnect");
        });

        // Create instance
        this.instance = this.client;
      } catch (error) {
        console.error("Failed to create Redis client:", error);
        throw error;
      }
    }
    return this.instance;
  }
  // Graceful shutdown method
  static async shutdown() {
    if (this.client) {
      try {
        await this.client.quit();
        console.log("Redis client disconnected");
      } catch (error) {
        console.error("Error shutting down Redis client:", error);
      }
      this.client = null;
      this.instance = null;
    }
  }
}

// Add utility function to get connected instance
const getIORedis = {
  get instanceConnect() {
    if (!RedisInitializer.instance) {
      console.warn(
        "Redis connection has not been initialized yet. Initializing now..."
      );
      RedisInitializer.getInstance().catch((err) => {
        console.error("Failed to initialize Redis connection:", err);
      });
    }
    return RedisInitializer.instance;
  },
};

module.exports = {
  getInstance: RedisInitializer.getInstance.bind(RedisInitializer),
  shutdown: RedisInitializer.shutdown.bind(RedisInitializer),
  getIORedis,
};
