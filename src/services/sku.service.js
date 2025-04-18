"use strict";

const skuModel = require("../models/sku.model");
const { randomSpuId } = require("../utils");
const _ = require("lodash");
const { setCacheIOExpiration } = require("../models/repository/cache.repo");
const { CACHE_PRODUCT } = require("../constants/cache.constant");
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
      if (sku_id < 0) return null;
      if (spu_id < 0) return null;

      const skuKeyCache = `${CACHE_PRODUCT.SKU}${sku_id}`;
      const skuData = await skuModel
        .findOne({
          sku_id,
          spu_id,
        })
        .lean();

      console.log(`skuData from DB::`, skuData);

      // Cache for 30 seconds
      const valuesCache = skuData || null;
      setCacheIOExpiration({
        key: skuKeyCache,
        value: JSON.stringify(valuesCache),
        expirationSeconds: 30,
      }).catch((err) => {
        console.error("Failed to set cache:", err);
      });

      // Return data from database
      return skuData
        ? {
            ...skuData,
            toLoad: "dbs",
          }
        : null;
    } catch (error) {
      console.error("Error in getDetailSku:", error);
      throw error;
    }
  };

  static getListSkuBySpuId = async ({ spu_id }) => {
    try {
      if (spu_id < 0) return null;

      const skusKeyCache = `${CACHE_PRODUCT.SKU_LIST}${spu_id}`;
      const skus = await skuModel.find({ spu_id }).lean();
      const valuesData = skus || null;

      setCacheIOExpiration({
        key: skusKeyCache,
        value: JSON.stringify(valuesData),
        expirationSeconds: 30,
      }).catch((err) => {
        console.error("Failed to set cache:", err);
      });

      return skus
        ? {
            skus,
            toLoad: "dbs",
          }
        : null;
    } catch (error) {
      console.error("Error in getListSkuBySpuId:", error);
      throw error;
    }
  };
}

module.exports = SKUService;
