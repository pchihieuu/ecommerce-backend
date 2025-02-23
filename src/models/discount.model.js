"use strict";

const { model, Schema } = require("mongoose");

const COLLECTION_NAME = "Discounts";
const DOCUMENT_NAME = "Discount";

const discountSchema = new Schema(
  {
    discount_name: {
      type: String,
      required: true,
    },
    discount_description: {
      type: String,
      required: true,
    },
    discount_type: {
      type: String,
      default: "FIXED_AMOUNT", // percentage, fixed_amount
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    discount_code: {
      type: String,
      required: true,
      unique: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    // so luong ma discount nay co the duoc ap dung
    discount_max_uses: {
      type: Number,
      required: true,
    },
    // so luong discount da su dung
    discount_used_count: {
      type: Number,
      required: true,
    },
    // Moi user duoc su dung discount nay toi da bao nhieu lan
    discount_max_uses_per_user: {
      type: Number,
      required: true,
      default: 1,
    },
    // users nao da su dung discount nay
    discount_users_used: {
      type: Array,
      default: [],
    },

    discount_min_order_value: {
      type: Number,
      required: true,
    },
    discount_shop_id: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_apllied_for: {
      type: String,
      required: true,
      enum: ["ALL", "SPECIFIC"],
    },
    // cac san pham duoc ap dung ma discount nay
    discount_product_ids: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
