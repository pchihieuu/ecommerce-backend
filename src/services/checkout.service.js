"use strict";

const { checkProductByServer } = require("../models/repository/product.repo");
const { BadRequestResponse } = require("../core/error.response");
const { findCartById } = require("../models/repository/cart.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const orderModel = require("../models/order.model");
const { removeAllProductsFromCart } = require("./cart.service");
const { convertToObjectId } = require("../utils");

class CheckoutService {
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // Validate cart exists
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestResponse("Cart does not exist");

    // Initialize checkout data structures
    const checkout_order = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0,
    };
    const shop_order_ids_new = [];

    // Process each shop's order
    for (const shopOrder of shop_order_ids) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
        feeShip = 0,
      } = shopOrder;

      // Enhanced product validation
      const validatedProducts = await Promise.all(
        item_products.map(async (product) => {
          const validatedProduct = await checkProductByServer([product]);
          if (!validatedProduct || validatedProduct.length === 0) {
            throw new BadRequestResponse(
              `Product ${product.productId} is invalid`
            );
          }
          return validatedProduct[0];
        })
      );

      // Calculate total raw price
      const checkoutPrice = validatedProducts.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0);

      // Update checkout order totals
      checkout_order.totalPrice += checkoutPrice;
      checkout_order.feeShip += feeShip;

      // Prepare shop checkout data
      const itemCheckout = {
        shopId,
        shop_discounts,
        feeShip,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: validatedProducts,
      };

      // Process discounts if available
      if (shop_discounts.length > 0) {
        try {
          const { amount } = await getDiscountAmount({
            code: shop_discounts[0].code,
            userId,
            shopId,
            products: validatedProducts,
          });

          // Update discount
          checkout_order.totalDiscount += amount;
          if (amount > 0) {
            itemCheckout.priceApplyDiscount = checkoutPrice - amount;
          }
        } catch (error) {
          console.error(`Discount error: ${error.message}`);
        }
      }

      // Update total checkout
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    // Add shipping to total checkout
    checkout_order.totalCheckout += checkout_order.feeShip;

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  static async orderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId,
        userId,
        shop_order_ids,
      });

    // Flatten products and check inventory
    const products = shop_order_ids_new.flatMap((order) => order.item_products);

    // Lock products and check inventory
    const lockResults = await Promise.all(
      products.map(async (product) => {
        const keyClock = await acquireLock({
          productId: product.productId,
          quantity: product.quantity,
          cartId,
        });
        return { product, keyClock };
      })
    );

    // Check if all products can be locked
    const failedLocks = lockResults.filter(({ keyClock }) => !keyClock);
    if (failedLocks.length > 0) {
      // Release any successfully acquired locks
      await Promise.all(
        lockResults
          .filter(({ keyClock }) => keyClock)
          .map(({ keyClock }) => releaseLock(keyClock))
      );

      throw new BadRequestResponse(
        "Some products are out of stock or have been updated. Please check your cart."
      );
    }

    // Create order
    const newOrder = await orderModel.create({
      order_user_id: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    // Remove products from cart if order is successful
    if (newOrder) {
      await removeAllProductsFromCart({ cartId, userId });

      // Release all locks
      await Promise.all(
        lockResults.map(({ keyClock }) => releaseLock(keyClock))
      );
    }

    return newOrder;
  }

  static async getOrdersByUser({ userId, limit = 10, page = 1 }) {
    // Validate userId
    if (!userId) {
      throw new BadRequestResponse("User ID is required");
    }

    const skip = (page - 1) * limit;

    const orders = await orderModel
      .find({ order_user_id: convertToObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await orderModel.countDocuments({
      order_user_id: convertToObjectId(userId),
    });

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit,
      },
    };
  }

  static async getOrderByUser({ userId, orderId }) {
    if (!userId || !orderId) {
      throw new BadRequestResponse("User ID and Order ID are required");
    }

    const order = await orderModel
      .findOne({
        _id: convertToObjectId(orderId),
        order_user_id: convertToObjectId(userId),
      })
      .lean();

    if (!order) {
      throw new BadRequestResponse("Order not found");
    }

    return order;
  }

  static async cancelOrderByUser({ userId, orderId }) {
    if (!userId || !orderId) {
      throw new BadRequestResponse("User ID and Order ID are required");
    }

    const order = await orderModel.findOneAndUpdate(
      {
        _id: convertToObjectId(orderId),
        order_user_id: convertToObjectId(userId),
        order_status: { $in: ["PENDING", "PROCESSING"] },
      },
      {
        order_status: "CANCEL",
        canceledAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      throw new BadRequestResponse(
        "Cannot cancel this order. It may have already been processed."
      );
    }

    // TODO: Implement inventory rollback logic here
    // Hoàn lại số lượng sản phẩm vào kho

    return order;
  }
}

module.exports = CheckoutService;
