"use strict";
const redis = require("redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = redis.createClient();
    this.publisher = redis.createClient();
  }

  async connectClients() {
    try {
      if (!this.publisher.isOpen) {
        console.log(">>> connected publisher");
        await this.publisher.connect();
      }
      if (!this.subscriber.isOpen) {
        console.log(">>> connected subscriber");
        await this.subscriber.connect();
      }
    } catch (error) {
      console.log("Error connecting to Redis:", error);
      throw error;
    }
  }

  async publish(channel, message) {
    await this.connectClients();
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          console.log("Error in publish:", err);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
  async subscribe(channel, callback) {
    await this.connectClients();
    this.subscriber.subscribe(channel);
    this.subscriber.on("message", (subscriberChannel, message) => {
      if (channel === subscriberChannel) {
        callback(channel, message);
      }
    });
  }

  // Add a method for cleanup/disconnection if needed
  async disconnect() {
    try {
      await this.publisher.quit();
      await this.subscriber.quit();
      console.log("Redis clients disconnected.");
    } catch (error) {
      console.log("Error disconnecting Redis clients:", error);
    }
  }
}

module.exports = new RedisPubSubService();
