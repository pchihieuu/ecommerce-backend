"use strict";

const { createClient } = require("redis");

class RedisInitializer {
  static instance = null;
  static client = null;

  // Singleton pattern for Redis client
  static async getInstance() {
    if (!this.instance) {
      try {
        // Create Redis client with comprehensive configuration
        this.client = createClient({
          // Configuration options
          socket: {
            host: process.env.REDIS_HOST || "localhost",
            port: process.env.REDIS_PORT || 6379,
          },
          // Optional authentication if needed
          // password: process.env.REDIS_PASSWORD,
        });

        // Error handling for client
        this.client.on("error", (err) => {
          console.error("Redis Client Error:", err);
        });

        // Connection success logging
        this.client.on("connect", () => {
          console.log("Redis client connected successfully");
        });

        // Implement reconnection strategy
        this.client.on("reconnecting", () => {
          console.log("Redis client attempting to reconnect");
        });

        // Connect to Redis
        await this.client.connect();

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

module.exports = {
  getInstance: RedisInitializer.getInstance.bind(RedisInitializer),
  shutdown: RedisInitializer.shutdown.bind(RedisInitializer),
};
