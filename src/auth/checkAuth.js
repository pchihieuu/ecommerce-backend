// "use strict";

// const HEADER = {
//   API_KEY: "x-api-key",
//   AUTHORIZATION: "authorization",
// };

// const { findById } = require("../services/apiKey.service");

// const apiKey = async (req, res, next) => {
//   try {
//     const key = req.headers[HEADER.API_KEY]?.toString();
//     if (!key) {
//       return res.status(403).json({
//         message: "Forbidden error",
//       });
//     }
//     // check objkey
//     const objKey = await findById(key);
//     if (!objKey) {
//       return res.status(403).json({
//         message: "Forbidden error",
//       });
//     }
//     req.objKey = objKey;
//     return next();
//   } catch (error) {}
// };

// const permission = (permission) => {
//   return (req, res, next) => {
//     if (!req.objKey.permissions) {
//       return res.status(403).json({
//         message: "Permissions denied",
//       });
//     }
//     console.log(`permission::`, req.body.permissions);
//     const validPermission = req.objKey.permissions.includes(permission);

//     if (!validPermission) {
//       return res.status(403).json({
//         message: "Permissions denied",
//       });
//     }
//     return next();
//   };
// };

// module.exports = {
//   apiKey,
//   permission,
// };

"use strict";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const { findById } = require("../services/apiKey.service");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();

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
