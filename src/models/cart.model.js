"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

const cartSchema = new Schema(
  {
    cart_products: {
      type: Array,
      required: true,
      default: [],
      /*
        [
            {
                product_id,
                shop_id,
                quantity,
                price,
                name
            }
        ]
     */
    },
    cart_state: {
      type: String,
      required: true,
      enum: ["ACTIVE", "COMPLETED", "FAILED", "PENDING"],
      default: "ACTIVE",
    },
    cart_count_product: {
      type: Number,
      default: 0,
    },
    cart_user_id: {
      type: Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, cartSchema);
