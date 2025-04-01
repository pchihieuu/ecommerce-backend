"use strict";

const { findSpuById } = require("../models/repository/spu.repo");
const {
  NotFoundResponse,
  ConflictResponse,
} = require("../core/error.response");
const { findShopById } = require("../models/repository/shop.repo");
const spuModel = require("../models/spu.model");
const { randomSpuId } = require("../utils");
const SKUService = require("./sku.service");
const _ = require("lodash");

class SPUService {
  static createNewSpu = async ({
    spu_id,
    spu_name,
    spu_slug,
    spu_description,
    spu_thumb,
    spu_price,
    spu_category,
    spu_shop,
    spu_attributes,
    spu_variations,
    spu_quantity,
    sku_list = [],
  }) => {
    try {
      // check if shop exists
      const foundShop = await findShopById({ shop_id: spu_shop });
      if (!foundShop) {
        throw new NotFoundResponse("Shop not found");
      }

      const foundSpu = await findSpuById({ spu_id: spu_id });
      if (foundSpu) {
        throw ConflictResponse("Spu already exists");
      }
      // 2. create a new spu
      const newSpu = await spuModel.create({
        spu_id: randomSpuId(),
        spu_name,
        spu_slug,
        spu_description,
        spu_thumb,
        spu_price,
        spu_category,
        spu_shop,
        spu_attributes,
        spu_variations,
        spu_quantity,
      });

      // 3. get spu_id add sku.service
      if (newSpu && sku_list.length > 0) {
        // create sku
        await SKUService.createNewSku({ spu_id: newSpu.spu_id, sku_list });
      }

      // 4. send via data elasticsearch (search.service)

      // 5. response result
      return newSpu;
    } catch (error) {
      console.error("Error in createNewSpu:", error);
      throw error;
    }
  };

  static getDetailSpu = async ({ spu_id }) => {
    try {
      const foundSpu = await findSpuById({ spu_id, isPublished: true });
      if (!foundSpu) {
        throw new NotFoundResponse("SPU not found");
      }

      const foundSkuList = await SKUService.getListSkuBySpuId({ spu_id });

      return {
        spu_info: _.omit(foundSpu, ["__v", "updatedAt"]),
        sku_list: foundSkuList.map((sku) =>
          _.omit(sku, ["__v", "updatedAt", "createdAt", "isDeleted"])
        ),
      };
    } catch (error) {
      console.error("Error in getDetailSpu:", error);
      throw error;
    }
  };
}

module.exports = SPUService;
