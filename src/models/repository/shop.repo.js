"use strict";

const shopModel = require("../shop.model");

const selectStruct = {
  email: 1,
  password: 1,
  role: 1,
  status: 1,
};

const findShopById = async ({ shop_id, select = selectStruct }) => {
  return await shopModel.findById(shop_id).select(select);
};

module.exports = {
  findShopById,
};
