"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Rating";
const COLLECTION_NAME = "Ratings";

const ratingSchema = new Schema(
  {
    rating_userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating_productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating_shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    rating_content: {
      type: String,
      default: "",
    },
    rating_value: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1.0"],
      max: [5, "Rating must be less than or equal to 5.0"],
    },
    rating_images: {
      type: [String],
      default: [],
    },
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

// Create compound index for userId and productId to ensure a user can only rate a product once
ratingSchema.index({ rating_userId: 1, rating_productId: 1 }, { unique: true });

module.exports = model(DOCUMENT_NAME, ratingSchema);
