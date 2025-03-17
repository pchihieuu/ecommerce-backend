"use strict";
require("dotenv").config();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { Client, GatewayIntentBits } = require("discord.js");
const { CHANNEL_ID, TOKEN_DISCORD } = process.env;

class LoggerService {
  constructor() {
    if (!CHANNEL_ID || !TOKEN_DISCORD) {
      console.error(
        "Discord logger disabled: Missing TOKEN_DISCORD or CHANNEL_ID"
      );
    }
    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      this.channelId = CHANNEL_ID;
      this.client.on("ready", () => {
        console.log(`Discord logger logged in as ${this.client.user.tag}`);
      });
      this.client.on("error", (error) => {
        console.error("Discord client error:", error.message);
      });
      this.client.login(TOKEN_DISCORD).catch((err) => {
        console.error("Failed to login to Discord:", err.message);
        this.enabled = false;
      });
    } catch (error) {
      console.error("Error initializing Discord logger:", error.message);
      this.enabled = false;
    }
  }

  isReady() {
    return this.enabled && this.client && this.client.isReady();
  }

  sendToMessage(message = "message") {
    if (!this.isReady()) {
      console.warn("Discord logger not ready. Message not sent.");
      return;
    }

    try {
      const channel = this.client.channels.cache.get(this.channelId);
      if (!channel) {
        console.error(
          `Could not find the Discord channel with ID: ${this.channelId}`
        );
        return;
      }

      channel
        .send(message)
        .catch((e) =>
          console.error("Error sending message to Discord:", e.message)
        );
    } catch (error) {
      console.error("Error in sendToMessage:", error.message);
    }
  }

  sendToFormatCode(logData) {
    if (!this.isReady()) {
      console.warn("Discord logger not ready. Code not sent.");
      return;
    }

    try {
      const {
        code,
        message = "This is some additional information about the code",
        title = "Code Example",
      } = logData;

      const codeMessage = {
        content: message,
        embeds: [
          {
            color: parseInt("00ff00", 16),
            title,
            description: "```json\n" + JSON.stringify(code, null, 2) + "\n ```",
          },
        ],
      };

      this.sendToMessage(codeMessage);
    } catch (error) {
      console.error("Error in sendToFormatCode:", error.message);
    }
  }

  pushToDiscord(req) {
    if (!this.isReady()) {
      return;
    }

    try {
      if (req.originalUrl.includes(".")) return;

      const logData = {
        code: {
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          headers: {
            "user-agent": req.get("user-agent"),
            "content-type": req.get("content-type"),
          },
          body: req.method !== "GET" ? this.sanitizeBody(req.body) : undefined,
        },
        title: `API Request: ${req.method} ${req.originalUrl}`,
        message: `New API request at ${new Date().toLocaleString()}`,
      };

      this.sendToFormatCode(logData);
    } catch (error) {
      console.error("Error pushing to Discord:", error.message);
    }
  }

  sanitizeBody(body) {
    if (!body) return {};

    const sanitized = { ...body };

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "credit_card",
      "accessToken",
      "refreshToken",
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "******";
      }
    });

    return sanitized;
  }
}

const loggerInstance = new LoggerService();
module.exports = loggerInstance;
