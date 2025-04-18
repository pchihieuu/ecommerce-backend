"use strict";

const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";

const commentSchema = new Schema(
  {
    comment_productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    comment_userId: {
      type: Schema.Types.ObjectId,
      default: 1,
    },
    comment_content: {
      type: String,
      default: "text",
    },
    comment_left: {
      type: Number,
      default: 0,
    },
    comment_right: {
      type: Number,
      default: 0,
    },
    comment_parentId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAME,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
      set: (val) => (val ? Math.round(val * 10) / 10 : null),
    },

    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

module.exports = model(DOCUMENT_NAME, commentSchema);
