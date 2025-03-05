"use strict";

const CheckoutService = require("../services/checkout.service");
const { SuccessResponse } = require("../core/success.response");
const { BadRequestResponse } = require("../core/error.response");

class CheckoutController {
  async checkoutReview(req, res, next) {
    new SuccessResponse({
      message: "Checkout review successful",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  }

  async orderByUser(req, res, next) {
    new SuccessResponse({
      message: "Order created successfully",
      metadata: await CheckoutService.orderByUser(req.body),
    }).send(res);
  }

  async getOrdersByUser(req, res, next) {
    new SuccessResponse({
      message: "Orders retrieved successfully",
      metadata: await CheckoutService.getOrdersByUser(req.query),
    }).send(res);
  }

  async getOrderByUser(req, res, next) {
    const { userId, orderId } = req.query;

    if (!userId || !orderId) {
      throw new BadRequestResponse("User ID and Order ID are required");
    }

    new SuccessResponse({
      message: "Order details retrieved successfully",
      metadata: await CheckoutService.getOrderByUser({
        userId,
        orderId,
      }),
    }).send(res);
  }

  async cancelOrderByUser(req, res, next) {
    const { userId, orderId } = req.query;

    new SuccessResponse({
      message: "Order canceled successfully",
      metadata: await CheckoutService.cancelOrderByUser({
        userId,
        orderId,
      }),
    }).send(res);
  }
}

module.exports = new CheckoutController();
