"use strict";

const inventoryModel = require("../models/inventory.model");
const { BadRequestResponse } = require("../core/error.response");
const { getProductById } = require("../models/repository/product.repo");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "Vuon Lai, District 12, HoChiMinh City",
  }) {
    const product = await getProductById({ productId });
    if (!product) throw new BadRequestResponse("Product doest not exist");

    const query = {
        inventory_shop_id: shopId,
        inventory_product_id: productId,
      },
      updateSet = {
        $inc: {
          inventory_stock: +stock,
        },
        $set: {
          inventory_location: location,
        },
      },
      options = { upsert: true, new: true };

    return await inventoryModel.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;
