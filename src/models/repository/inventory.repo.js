"use strict";

const { convertToObjectId } = require("../../utils");
const inventoryModel = require("../inventory.model");

const insertInventory = async ({
  product_id,
  location = "Unknown",
  stock,
  shop_id,
}) => {
  return await inventoryModel.create({
    inventory_product_id: product_id,
    inventory_location: location,
    inventory_stock: stock,
    inventory_shop_id: shop_id,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inventory_product_id: convertToObjectId(productId),
      inventory_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: {
        inventory_stock: -quantity,
      },
      $push: {
        inventory_reservations: {
          quantity,
          cartId,
          createdAt: new Date(),
        },
      },
    },
    options = { upsert: true, new: true };

  return await inventoryModel.updateOne(query, updateSet);
};

const getInventoryByProductId = async (productId) => {
  return await inventoryModel
    .findOne({
      inventory_product_id: convertToObjectId(productId),
    })
    .populate("inventory_product_id")
    .lean();
};

const getInventoryByShopId = async (shopId, limit = 30, skip = 0) => {
  return await inventoryModel
    .find({
      inventory_shop_id: convertToObjectId(shopId),
    })
    .populate("inventory_product_id")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const getLowStockInventory = async (shopId, threshold = 10) => {
  return await inventoryModel
    .find({
      inventory_shop_id: convertToObjectId(shopId),
      inventory_stock: { $lte: threshold },
    })
    .populate("inventory_product_id")
    .sort({ inventory_stock: 1 })
    .lean();
};

module.exports = {
  insertInventory,
  reservationInventory,
};
