"use strict";

const skuModel = require("../models/sku.model");
const { randomSpuId } = require("../utils");
const _ = require("lodash");
class SKUService {
  static createNewSku = async ({ spu_id, sku_list }) => {
    try {
      const convertSkuList = sku_list.map((sku) => {
        return { ...sku, spu_id: spu_id, sku_id: `${spu_id}.${randomSpuId()}` };
      });
      const skus = await skuModel.create(convertSkuList);
      return skus;
    } catch (error) {
      console.error("Error in createNewSku:", error);
      throw error;
    }
  };

  static getDetailSku = async ({ sku_id, spu_id }) => {
    try {
      // read cache
      const sku = await skuModel
        .findOne({
          sku_id,
          spu_id,
        })
        .lean();

      if (sku) {
        // set cache
      }
      return _.omit(sku, ["__v", "updatedAt", "createdAt"]);
    } catch (error) {
      console.error("Error in getDetailSku:", error);
      throw error;
    }
  };

  static getListSkuBySpuId = async ({ spu_id }) => {
    try {
      const skus = await skuModel.find({ spu_id }).lean();
      return skus;
    } catch (error) {
      console.error("Error in getListSkuBySpuId:", error);
      throw error;
    }
  };
}

module.exports = SKUService;
