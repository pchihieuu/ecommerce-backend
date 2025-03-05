"use strict";

const { convertToObjectId } = require("../utils");
const cartModel = require("../models/cart.model");
const {
  createUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
} = require("../models/repository/cart.repo");
const { getProductById } = require("../models/repository/product.repo");
const { NotFoundResponse } = require("../core/error.response");

class CartService {
  static async addToCart({ userId, product = {} }) {
    // Extract product_id, regardless of whether it's called product_id or productId
    const productId = product.product_id || product.productId;

    if (!productId) {
      throw new NotFoundResponse("Product ID is required");
    }

    // Fetch the complete product details from database
    const foundProduct = await getProductById({ productId });

    if (!foundProduct) {
      throw new NotFoundResponse("Product not found");
    }

    // Create a complete product object with all details from the database
    const cartProduct = {
      product_id: productId,
      shop_id: foundProduct.product_shop.toString(),
      name: foundProduct.product_name, // Include the product name
      price: foundProduct.product_price, // Include the product price
      quantity: product.quantity || 1, // Default to 1 if quantity not provided
    };

    // Check if cart exists
    const userCart = await cartModel.findOne({
      cart_user_id: convertToObjectId(userId),
    });

    if (!userCart) {
      // Create new cart if it doesn't exist
      return await createUserCart({
        userId,
        product: cartProduct,
      });
    }

    // If cart exists but is empty, add the product
    if (!userCart.cart_products.length) {
      userCart.cart_products = [cartProduct];
      return await userCart.save();
    }

    // If cart exists and has products, update quantity or add new product
    return await updateCartItemQuantity({
      userId,
      product: cartProduct,
    });
  }

  static async updateCart({ userId, shop_order_ids }) {
    if (!shop_order_ids || !shop_order_ids[0]) {
      throw new NotFoundResponse("Invalid order data");
    }

    const { product_id, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    const foundProduct = await getProductById({ productId: product_id });

    if (!foundProduct) throw new NotFoundResponse("Product does not exist");

    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shop_id)
      throw new NotFoundResponse("Product does not belong to the shop");

    if (quantity === 0) {
      return await removeItemFromCart({
        user_id: userId,
        product_id,
      });
    }

    return await updateCartItemQuantity({
      userId,
      product: {
        product_id,
        name: foundProduct.product_name,
        price: foundProduct.product_price,
        shop_id: foundProduct.product_shop.toString(),
        quantity: quantity - old_quantity,
      },
    });
  }

  static async getListProductsFromCart({ userId }) {
    return await cartModel.findOne({
      cart_user_id: convertToObjectId(userId),
    });
  }

  static async removeItemFromCart({ user_id, product_id }) {
    return await removeItemFromCart({
      user_id,
      product_id,
    });
  }
  static async removeAllProductsFromCart({ cartId, userId }) {
    const query = {
      cart_user_id: convertToObjectId(userId),
    };
    const updateSet = {
      $set: {
        cart_products: [],
        cart_count_product: 0,
      },
    };
    return await cartModel.findOneAndUpdate(query, updateSet, { new: true });
  }
}

module.exports = CartService;
