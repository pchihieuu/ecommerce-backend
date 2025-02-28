"use strict";

const Logger = require("../loggers/discord.log");

const pushToLogDiscord = async (req, res, next) => {
  try {
    console.log(req.get("host"));
    Logger.sendToFormatCode({
      title: `Method: ${req.method}`,
      code: req.method === "GET" ? req.query | req.params : req.body,
      message: `${req.get("host")} ${req.originalUrl}`,
    });
    return next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  pushToLogDiscord,
};
