"use strict";

const { model, Schema } = require("mongoose");
const COLLECTION_NAME = "Templates";
const DOCUMENT_NAME = "Template";

const templateSchema = new Schema(
  {
    template_id: {
      type: Number,
      required: true,
    },
    template_name: {
      type: String,
      required: true,
    },
    template_html: {
      type: String,
      required: true,
    },
    template_status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, templateSchema);
