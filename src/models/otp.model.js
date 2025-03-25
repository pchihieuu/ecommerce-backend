"use strict";

const { model, Schema } = require("mongoose");
const COLLECTION_NAME = "Otps";
const DOCUMENT_NAME = "Otp";

const otpSchema = new Schema(
  {
    otp_email: {
      type: String,
      required: true,
    },
    otp_token: {
      type: String,
      required: true,
    },
    otp_status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
    user_password: {
      type: String,
      required: true,
    },
    expiredAt: {
      type: Date,
      required: true,
      default: Date.now(),
      expires: 60 * 15, // 15 minutes expiration
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, otpSchema);
