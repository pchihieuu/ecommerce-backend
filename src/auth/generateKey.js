"use strict";

const mongoose = require("mongoose");
const crypto = require("crypto");
const apikeyModel = require("../models/apikey.model");

const generateKey = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/shopDEV");

    const newKey = await apikeyModel.create({
      key: crypto.randomBytes(32).toString("hex"),
      permissions: ["0000"],
      status: true,
    });

    console.log("Generated API Key:", newKey.key);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

generateKey();
