"use strict";

const redis = require("redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = redis.createClient();
    this.publisher = redis.createClient();
    this.subscriptions = new Map();
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
    try {
      const reply = await this.publisher.publish(channel, message);
      return reply;
    } catch (err) {
      console.log("Error in publish:", err);
      throw err;
    }
  }

  async subscribe(channel, callback) {
    await this.connectClients();

    // Lưu callback vào Map để có thể tham chiếu sau này
    this.subscriptions.set(channel, callback);

    try {
      // Đăng ký subscriber với callback bọc
      await this.subscriber.subscribe(channel, (message, channel) => {
        const cb = this.subscriptions.get(channel);
        if (cb) {
          cb(channel, message);
        }
      });

      console.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      console.log("Error in subscribe:", error);
      throw error;
    }
  }

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
