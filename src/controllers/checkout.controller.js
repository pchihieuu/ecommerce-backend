"use strict";

const CheckoutService = require("../services/checkout.service");
const { SuccessRespone } = require("../core/success.respone");

class CheckoutController {
  async checkoutReview(req, res, next) {
    new SuccessRespone({
      message: "Checkout review successful",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  }
}

module.exports = new CheckoutController();
