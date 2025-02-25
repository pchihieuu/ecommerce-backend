"use strict";

const { SuccessRespone } = require("../core/success.respone");
const CartService = require("../services/cart.service");

class CartController {
  async addToCart(req, res, next) {
    new SuccessRespone({
      message: "Create new cart success",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  }

  async updateCart(req, res, next) {
    new SuccessRespone({
      message: "Update cart successful",
      metadata: await CartService.updateCart(req.body),
    }).send(res);
  }

  async getListProductsFromCart(req, res, next) {
    new SuccessRespone({
      message: "Get list product from cart success",
      metadata: await CartService.getListProductsFromCart({
        // req.query,
        userId: req.params.id,
      }),
    }).send(res);
  }

  async removeItemFromCart(req, res, next) {
    new SuccessRespone({
      message: "Remove item from cart success",
      metadata: await CartService.removeItemFromCart(req.body),
    }).send(res);
  }
}

module.exports = new CartController();
