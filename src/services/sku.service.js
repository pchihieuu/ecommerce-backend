"use strict";

const skuModel = require("../models/sku.model");
const { randomSpuId } = require("../utils");
const _ = require("lodash");
const {
  setCacheIOExpiration,
} = require("../models/repository/cache.repo");
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

      // // Get data from cache
      // let skuCache = await getCacheIO({ key: skuKeyCache });

      // // If there is data the cache, parse and return it
      // if (skuCache) {
      //   return {
      //     ...JSON.parse(skuCache),
      //     toLoad: "cache",
      //   };
      // }

      //If not in cache, read from database
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
      const skus = await skuModel.find({ spu_id }).lean();
      return skus;
    } catch (error) {
      console.error("Error in getListSkuBySpuId:", error);
      throw error;
    }
  };
}

module.exports = SKUService;
