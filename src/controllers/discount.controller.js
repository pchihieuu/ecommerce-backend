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

  getAllDiscountCodes = async (req, res, next) => {
    new SuccessRespone({
      message: "Successful code found",
      metadata: await DiscountService.getAllDiscountCodeByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  };

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
    }).send(res);
  };
}

module.exports = new DiscountController();
