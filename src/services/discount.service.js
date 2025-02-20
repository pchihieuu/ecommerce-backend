"use strict";

const { convertToObjectId } = require("../utils");
const { BadRequestRespone, NotFoundRespone } = require("../core/error.respone");
const discountModel = require("../models/discount.model");
const { findAllProducts } = require("../models/repository/product.repo");
const {
  findAllDiscountCodeSelect,
  findAllDiscountCodeUnselect,
} = require("../models/repository/discount.repo");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shop_id,
      apllied_for,
      min_order_value,
      product_ids = [],
      name,
      description,
      type,
      value,
      max_uses,
      used_count,
      max_uses_per_user,
    } = payload;
    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestRespone("Discount code has expired");
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestRespone("Start_date must be before end_date");
    }

    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: new convertToObjectId(shop_id),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestRespone("Discount code already exist");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value,
      discount_is_active: is_active,
      discount_apllied_for: apllied_for,
      discount_product_ids: apllied_for === "ALL" ? [] : product_ids,
    });
    return newDiscount;
  }
  static async updateDiscountCode() {}

  /* Get all discountcode available with products */
  static async getAllDiscountCodeWithProduct({
    limit,
    page,
    shop_id,
    code,
    user_id,
  }) {
    // Create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: new convertToObjectId(shop_id),
      })
      .lean();
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundRespone("Discount does not exist or has expired");
    }

    const { discount_apllied_for, discount_product_ids } = foundDiscount;
    let products;
    if (discount_apllied_for === "ALL") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit,
        sort: "ctime",
        page,
        select: ["product_name", "product_price", "product_thumb"],
      });
    }

    if (discount_apllied_for === "SPECIFIC") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit,
        page,
        sort: "ctime",
        select: ["product_name", "product_price", "product_thumb"],
      });
    }
    return products;
  }

  static async getAllDiscountCodeByShop({ limit, page, shop_id }) {
    return findAllDiscountCodeUnselect({
      filter: {
        discount_shop_id: convertToObjectId(shop_id),
        discount_is_active: true,
      },
      limit: limit,
      page: +page,
      model: discountModel,
      unSelect: ["__v"],
    });
  }
}

module.exports = DiscountService;
