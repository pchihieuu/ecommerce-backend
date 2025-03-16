// "use strict";

// const Logger = require("../loggers/discord.log");

// const pushToLogDiscord = async (req, res, next) => {
//   try {
//     console.log(req.get("host"));
//     Logger.sendToFormatCode({
//       title: `Method: ${req.method}`,
//       code: req.method === "GET" ? req.query | req.params : req.body,
//       message: `${req.get("host")} ${req.originalUrl}`,
//     });
//     return next();
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   pushToLogDiscord,
// };

"use strict";

const Logger = require("../loggers/discord.log");

/**
 * Middleware gửi log đến Discord
 */
const pushToLogDiscord = async (req, res, next) => {
  try {
    if (req.originalUrl.includes("/health") || req.originalUrl.includes(".")) {
      return next();
    }

    console.log(`Request from: ${req.get("host")}`);
    const logData = {
      title: `Method: ${req.method}`,
      code:
        req.method === "GET"
          ? { ...req.query, ...req.params }
          : sanitizeRequestBody(req.body),
      message: `${req.get("host")} ${req.originalUrl}`,
    };

    Logger.sendToFormatCode(logData);

    return next();
  } catch (error) {
    console.error("Error in Discord logging:", error.message);
    return next();
  }
};

/**
 * Middleware xử lý CORS
 */
const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key"
  );
  res.header("Access-Control-Max-Age", "86400");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
};

/**
 * Loại bỏ thông tin nhạy cảm từ request body
 */
const sanitizeRequestBody = (body) => {
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
};

module.exports = {
  pushToLogDiscord,
  corsMiddleware,
};
