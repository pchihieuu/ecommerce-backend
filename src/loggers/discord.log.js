// "use strict";

// const { Client, GatewayIntentBits } = require("discord.js");
// require("dotenv").config();
// const { CHANNEL_ID, TOKEN_DISCORD } = process.env;

// class LoggerService {
//   constructor() {
//     this.client = new Client({
//       intents: [
//         GatewayIntentBits.DirectMessages,
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent,
//       ],
//     });
//     // add channelId
//     this.channelId = CHANNEL_ID;
//     this.client.on("ready", () => {
//       console.log(`Logged is as ${this.client.user.tag}`);
//     });
//     this.client.login(TOKEN_DISCORD);
//   }

//   sendToMessage(message = "message") {
//     const channel = this.client.channels.cache.get(this.channelId);
//     if (!channel) {
//       console.error(`Could not find the channel...`, this.channelId);
//       return;
//     }
//     channel.send(message).catch((e) => console.error(e));
//   }

//   sendToFormatCode(logData) {
//     const {
//       code,
//       message = "This is some additional information about the code",
//       title = "Code Example",
//     } = logData;
//     const codeMessage = {
//       content: message,
//       embeds: [
//         {
//           color: parseInt("00ff00", 16),
//           title,
//           description: "```json\n" + JSON.stringify(code, null, 2) + "\n ```",
//         },
//       ],
//     };
//     this.sendToMessage(codeMessage);
//   }
// }

// module.exports = new LoggerService();

"use strict";

const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { CHANNEL_ID, TOKEN_DISCORD } = process.env;

class LoggerService {
  constructor() {
    // Kiểm tra xem các biến môi trường cần thiết có tồn tại không
    if (!CHANNEL_ID || !TOKEN_DISCORD) {
      console.warn(
        "Discord logger disabled: Missing TOKEN_DISCORD or CHANNEL_ID"
      );
      this.enabled = false;
      return;
    }

    this.enabled = true;
    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      // Thêm channelId
      this.channelId = CHANNEL_ID;

      // Xử lý sự kiện ready
      this.client.on("ready", () => {
        console.log(`Discord logger logged in as ${this.client.user.tag}`);
      });

      // Xử lý lỗi kết nối
      this.client.on("error", (error) => {
        console.error("Discord client error:", error.message);
      });

      // Đăng nhập vào Discord
      this.client.login(TOKEN_DISCORD).catch((err) => {
        console.error("Failed to login to Discord:", err.message);
        this.enabled = false;
      });
    } catch (error) {
      console.error("Error initializing Discord logger:", error.message);
      this.enabled = false;
    }
  }

  // Hàm kiểm tra xem client đã sẵn sàng chưa
  isReady() {
    return this.enabled && this.client && this.client.isReady();
  }

  // Gửi tin nhắn đến kênh Discord
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

  // Gửi mã định dạng đến kênh Discord
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

  // Hàm mới: Gửi thông tin request API
  pushToDiscord(req) {
    if (!this.isReady()) {
      return;
    }

    try {
      // Chỉ log các request API, bỏ qua các static files
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
          // Chỉ lấy một số trường dữ liệu cần thiết, tránh log thông tin nhạy cảm
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

  // Hàm xử lý dữ liệu nhạy cảm trước khi gửi log
  sanitizeBody(body) {
    if (!body) return {};

    // Tạo bản sao để không thay đổi dữ liệu gốc
    const sanitized = { ...body };

    // Loại bỏ các trường nhạy cảm
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

// Tạo và export singleton instance
const loggerInstance = new LoggerService();
module.exports = loggerInstance;
