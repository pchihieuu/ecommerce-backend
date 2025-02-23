"use strict";

const DiscountService = require("../services/discount.service");
const { SuccessRespone } = require("../core/success.respone");

class DiscountController {
  createDiscountCode = async (req, res, next) => {
    new SuccessRespone({
      message: "Successful code generations",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shop_id: req.user.userId,
      }),
    }).send(res);
  };

  updateDiscount = async (req, res, next) => {
    new SuccessRespone({
      message: "Success",
      metadata: await DiscountService.updateDiscountCode(req.body),
    }).send(res);
  };

  // new getAllDiscountCodes controller
  getAllDiscountCodes = async (req, res, next) => {
    new SuccessRespone({
      message: "Successful code found",
      metadata: await DiscountService.getAllDiscountCodeByShopV2({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };
  getAllDiscountCodeByShop = async (req, res, next) => {
    new SuccessRespone({
      message: "Success",
      metadata: await DiscountService.getAllDiscountCodeByShop({
        limit: req.query.limit || 50,
        page: req.query.page || 1,
        shop_id: req.user.userId,
      }),
    }).send(res);
  };

  getProductsByDiscount = async (req, res, next) => {
    new SuccessRespone({
      message: "Success",
      metadata: await DiscountService.getProductsByDiscount({
        limit: req.query.limit,
        page: req.query.page,
        shop_id: req.params.shopId,
        code: req.params.code,
        user_id: "",
      }),
    }).send(res);
  };

  // new controller
  getDiscountAmount = async (req, res, next) => {
    new SuccessRespone({
      message: "Success code found",
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  };

  getAllDiscountCodeWithProducts = async (req, res, next) => {
    new SuccessRespone({
      message: "Success code found",
      metadata: await DiscountService.getAllDiscountCodeWithProduct({
        ...req.query,
      }),
    }).send(res);
  };

  // old controller
  // getDiscountAmount = async (req, res, next) => {
  //   new SuccessRespone({
  //     message: "Success",
  //     metadata: await DiscountService.getDiscountAmount(req.body),
  //   }).send(res);
  // };

  deleteDiscount = async (req, res, next) => {
    new SuccessRespone({
      message: "Success",
      metadata: await DiscountService.deleteDiscountCode({
        ...req.query,
      }),
    }).send(res);
  };

  cancelDiscount = async (req, res, next) => {
    new SuccessRespone({
      message: "Success",
      metadata: await DiscountService.cancelDiscount(req.body),
    });
  };

  //   getAllDiscountCodeByShop = async (req, res, next) => {
  //     new SuccessRespone({
  //       message: "Get all discountcode by shop success",
  //       metadata: await DiscountService.getAllDiscountCodeByShop({
  //         limit: 50,
  //         page: 1,
  //         shop_id: req.user.userId,
  //       }),
  //     }).send(res);
  //   };

  //   getProductsByDiscount = async (req, res, next) => {
  //     new SuccessRespone({
  //       message: "Get product by discount success",
  //       metadata: await DiscountService.getAllDiscountCodeWithProduct({
  //         ...req.query,
  //       }),
  //     }).send(res);
  //   };
  //   getDiscountAmount = async (req, res, next) => {
  //     new SuccessRespone({
  //       message: "Success",
  //       metadata: await DiscountService.getDiscountAmount(req.body),
  //     }).send(res);
  //   };
  //   deleteDiscount = async (req, res, next) => {
  //     new SuccessRespone({
  //       message: "Success",
  //       metadata: await DiscountService.deleteDiscount(req.body),
  //     }).send(res);
  //   };

  //   cancelDiscount = async (req, res, next) => {
  //     new SuccessRespone({
  //       message: "Success",
  //       metadata: await DiscountService.cancelDiscount(req.body),
  //     }).send(res);
  //   };
}

module.exports = new DiscountController();
