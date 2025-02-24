"use strict";

const { convertToObjectId } = require("../utils");
const cartModel = require("../models/cart.model");
const {
  createUserCart,
  updateCartItemQuantity,
} = require("../models/repository/cart.repo");

/*

    Key features: Cart service
    - add product to cart [user]
    - reduce product quantity be one [User]
    - increase product quantity by One [User]
    - get cart [User]
    - Delete cart [User]
    - Delete cart items [User]
 */

class CartService {
  static async addToCart({ userId, product = {} }) {
    // check cart ton tai khong?
    const userCart = await cartModel.findOne({
      cart_user_id: convertToObjectId(userId),
    });
    if (!userCart) {
      // tao gio hang moi neu gio hang chua ton tai
      return await createUserCart({
        userId,
        product,
      });
    }

    // neu gio hang ton tai nhung chua co san pham thi them san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    return await updateCartItemQuantity({
      userId,
      product,
    });
  }
}

module.exports = CartService;
