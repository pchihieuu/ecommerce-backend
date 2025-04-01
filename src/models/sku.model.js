"use strict";

const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "SKU";
const COLLECTION_NAME = "SKUs";

const skuSchema = new Schema(
  {
    sku_id: {
      type: String,
      required: true,
      unique: true,
    },
    sku_tier_index: {
      type: Array,
      default: [0],
    },
    sku_default: {
      type: Boolean,
      default: false,
    },
    sku_slug: {
      type: String,
      default: "",
    },
    sku_sort: {
      type: Number,
      default: 0,
    },
    sku_stock: {
      type: Number,
      default: 0,
    },
    spu_id: {
      type: String,
      required: true,
    },
    sku_price: {
      type: String,
      required: true,
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, skuSchema);
