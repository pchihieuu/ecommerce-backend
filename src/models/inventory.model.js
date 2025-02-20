"use strict";

const { model, Schema } = require("mongoose");
const COLLECTION_NAME = "Inventories";
const DOCUMENT_NAME = "Inventory";

const inventorySchema = new Schema(
  {
    inventory_product_id: {
      type: Schema.ObjectId,
      ref: "Product",
    },
    inventory_location: {
      type: String,
      default: "Unknown",
    },
    inventory_stock: {
      type: Number,
      required: true,
    },
    inventory_shop_id: {
      type: Schema.ObjectId,
      ref: "Shop",
    },
    // inventory_reservations => saves information about stores adding products
    inventory_reservations: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);
