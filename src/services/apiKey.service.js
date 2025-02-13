// "use strict";

// const apikeyModel = require("../models/apikey.model");

// const findById = async (key) => {
//   const newkey = await apikeyModel.create({
//     key: crypto.randomBytes(64).toString("hex"),
//     permission: ["0000"],
//   });
//   console.log(newkey);
//   const objkey = await apikeyModel.findOne({ key, status: true }).lean();
//   return objkey;
// };

// module.exports = { findById };

"use strict";

const crypto = require("crypto");
const apikeyModel = require("../models/apikey.model");

const findById = async (key) => {
  try {
    // First try to find an existing key
    const objKey = await apikeyModel.findOne({ key, status: true }).lean();

    if (objKey) {
      return objKey;
    }

    // If key doesn't exist and the provided key matches our pattern
    // we can optionally create a new one
    if (key && key.length >= 10) {
      // Some basic validation
      const newKey = await apikeyModel.create({
        key: key,
        permissions: ["0000"],
        status: true,
      });
      return newKey;
    }

    return null;
  } catch (error) {
    console.error("Find API Key Error:", error);
    return null;
  }
};

const generateKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  findById,
  generateKey,
};
