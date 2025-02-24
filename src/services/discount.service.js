"use strict";

const { BadRequestRespone, NotFoundRespone } = require("../core/error.respone");
const discountModel = require("../models/discount.model");
const { findAllProducts } = require("../models/repository/product.repo");
const {
  findAllDiscountCodeSelect,
  checkDiscountExists,
  updateDiscountByCode,
} = require("../models/repository/discount.repo");
const {
  convertToObjectId,
  updateNestedObject,
  removeUndefinedObject,
} = require("../utils");

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
      max_value,
      users_used,
      value,
      max_uses,
      used_count,
      max_uses_per_user,
    } = payload;

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestRespone("Start_date must be before end_date");
    }

    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectId(shop_id),
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
      discount_max_value: max_value,
      discount_users_used: users_used,
      discount_used_count: used_count,
      discount_shop_id: shop_id,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value,
      discount_is_active: is_active,
      discount_apllied_for: apllied_for,
      discount_product_ids: apllied_for === "ALL" ? [] : product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode({ code, bodyUpdate }) {
    let body = updateNestedObject(bodyUpdate);
    body = removeUndefinedObject(body);
    return await updateDiscountByCode({
      code,
      body,
    });
  }

  static async getAllDiscountCodeWithProduct({ code, shop_id, limit, page }) {
    console.log("Search params:", { code, shop_id });

    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectId(shop_id),
      })
      .lean();

    console.log("Found discount:", foundDiscount);
    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundRespone("discount not exists");
    }

    const { discount_apllied_for, discount_product_ids } = foundDiscount;
    let products;
    if (discount_apllied_for === "ALL") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_apllied_for === "SPECIFIC") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }
    return products;
  }

  static async getProductsByDiscount({ code, shop_id, user_id, limit, page }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectId(shop_id),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundRespone("Discount does not exist or has expired");
    }
    // applied_for === "ALL" or "SPECIFIC"
    const { discount_applied_for, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applied_for === "ALL") {
      // get all products
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
    } else if (discount_applied_for === "SPECIFIC") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit,
        sort: "ctime",
        page,
        select: ["product_name", "product_price", "product_thumb"],
      });
    }
    return products;
  }

  static async getAllDiscountCodeByShop({ limit, page, shopId }) {
    const discount = await findAllDiscountCodeSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shop_id: convertToObjectId(shopId),
        discount_is_active: true,
      },
      model: discountModel,
      select: ["discount_code", "discount_name"],
    });
    return discount;
  }

  static async getDiscountAmount({ code, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: code,
        discount_shop_id: convertToObjectId(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundRespone("Discount does not exist");

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundRespone("Discount expired");
    }

    if (!discount_max_uses) {
      throw new NotFoundRespone("Discount is out");
    }

    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundRespone(
          `Discount requires a min order value of ${discount_min_order_value}`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUserDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUserDiscount) {
        const userUsedCount = discount_users_used.reduce((total, item) => {
          return item === userId ? total + 1 : total;
        }, 0);
        if (userUsedCount >= discount_max_uses_per_user) {
          throw new BadRequestRespone("User overused discount");
        }
      }
    }

    const amount =
      discount_type === "FIXED_AMOUNT"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      amount,
      total_price: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, code }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: code,
      discount_shop_id: convertToObjectId(shopId),
    });
    return deleted;
  }

  static async cancelDiscount({ code, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: code,
        discount_shop_id: convertToObjectId(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundRespone("Discount does not exists");
    }
    const { discount_is_active } = foundDiscount;

    if (!discount_is_active) {
      throw new BadRequestRespone("Discount expired");
    }

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_used_count: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;
