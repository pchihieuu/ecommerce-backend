"use strict";

const CheckoutService = require("../services/checkout.service");
const { SuccessRespone } = require("../core/success.respone");
const { BadRequestRespone } = require("../core/error.respone");

class CheckoutController {
  async checkoutReview(req, res, next) {
    new SuccessRespone({
      message: "Checkout review successful",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  }

  async orderByUser(req, res, next) {
    new SuccessRespone({
      message: "Order created successfully",
      metadata: await CheckoutService.orderByUser(req.body),
    }).send(res);
  }

  async getOrdersByUser(req, res, next) {
    new SuccessRespone({
      message: "Orders retrieved successfully",
      metadata: await CheckoutService.getOrdersByUser(req.query),
    }).send(res);
  }

  async getOrderByUser(req, res, next) {
    const { userId, orderId } = req.query;

    if (!userId || !orderId) {
      throw new BadRequestRespone("User ID and Order ID are required");
    }

    new SuccessRespone({
      message: "Order details retrieved successfully",
      metadata: await CheckoutService.getOrderByUser({
        userId,
        orderId,
      }),
    }).send(res);
  }

  async cancelOrderByUser(req, res, next) {
    const { userId, orderId } = req.query;

    new SuccessRespone({
      message: "Order canceled successfully",
      metadata: await CheckoutService.cancelOrderByUser({
        userId,
        orderId,
      }),
    }).send(res);
  }
}

module.exports = new CheckoutController();
