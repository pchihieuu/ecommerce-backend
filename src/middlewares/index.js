"use strict";
const Logger = require("../loggers/discord.log");

/**
 * Middleware to send log to Discord
 */
const pushToLogDiscord = async (req, res, next) => {
  try {
    if (
      req.originalUrl.includes("/health") ||
      req.originalUrl.includes(".") ||
      req.method === "OPTIONS"
    ) {
      return next();
    }

    if (!req.discordLogSent) {
      console.log(`Request from: ${req.get("host")}`);
      const logData = {
        title: `Method: ${req.method}`,
        code:
          req.method === "GET"
            ? { ...req.query, ...req.params }
            : sanitizeRequestBody(req.body),
        message: `${req.get("host")} ${req.originalUrl}`,
      };

      // Mark the request as logged
      req.discordLogSent = true;

      Logger.sendToFormatCode(logData);
    }

    return next();
  } catch (error) {
    console.error("Error in Discord logging:", error.message);
    return next();
  }
};

/**
 * Middleware to handle CORS
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
 * Sanitize sensitive information from request body
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
