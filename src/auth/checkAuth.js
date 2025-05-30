"use strict";

const HEADERS = require("../constants/headers.constant");
const { findById } = require("../services/apiKey.service");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADERS.API_KEY]?.toString();

    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error: API Key Required",
      });
    }

    // check objkey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error: Invalid API Key",
      });
    }

    req.objKey = objKey;
    return next();
  } catch (error) {
    console.error("API Key Middleware Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey || !req.objKey.permissions) {
      return res.status(403).json({
        message: "Permission Denied: No permissions found",
      });
    }

    console.log("Checking Permission::", {
      required: permission,
      available: req.objKey.permissions,
    });

    const validPermission = req.objKey.permissions.includes(permission);

    if (!validPermission) {
      return res.status(403).json({
        message: "Permission Denied: Invalid permission level",
      });
    }

    return next();
  };
};

module.exports = {
  apiKey,
  permission,
};
