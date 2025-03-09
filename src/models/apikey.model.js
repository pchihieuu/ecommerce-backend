"use strict";

const { model, Schema, Types } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";
const PERMISSIONS = require("../constants/permissions.constant");
// Declare the Schema of the Mongo model
const apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: Boolean,
      index: true,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: Object.values(PERMISSIONS),
      default: [PERMISSIONS.READ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "30d",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeySchema);
