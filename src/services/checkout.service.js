"use strict";

const { checkProductByServer } = require("../models/repository/product.repo");
const { BadRequestResponse } = require("../core/error.response");
const { findCartById } = require("../models/repository/cart.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const orderModel = require("../models/order.model");
const { removeAllProductsFromCart } = require("./cart.service");
const { convertToObjectId } = require("../utils");
const { product } = require("../models/product.model");
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

    // Validate and reduce product quantities
    const updateProductPromises = products.map(async (productItem) => {
      const foundProduct = await product.findById(productItem.productId);

      if (!foundProduct) {
        throw new BadRequestResponse(
          `Product ${productItem.productId} not found`
        );
      }

      // Kiểm tra số lượng sản phẩm
      if (foundProduct.product_quantity < productItem.quantity) {
        throw new BadRequestResponse(
          `Insufficient quantity for product ${foundProduct.product_name}`
        );
      }

      // Giảm số lượng sản phẩm
      foundProduct.product_quantity -= productItem.quantity;
      await foundProduct.save();

      return foundProduct;
    });
    // Thực hiện giảm số lượng sản phẩm
    await Promise.all(updateProductPromises);
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

    const failedLocks = lockResults.filter(({ keyClock }) => !keyClock);
    if (failedLocks.length > 0) {
      // Hoàn lại số lượng sản phẩm nếu lock thất bại
      await Promise.all(
        updateProductPromises.map(async (productPromise) => {
          const foundProduct = await productPromise;
          foundProduct.product_quantity += failedLocks.find(
            (fail) => fail.product.productId === foundProduct._id.toString()
          ).product.quantity;
          await foundProduct.save();
        })
      );

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
      order_status: "PROCESSING", // Thêm trạng thái ban đầu
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
    // Tìm order
    const order = await orderModel.findOne({
      _id: convertToObjectId(orderId),
      order_user_id: convertToObjectId(userId),
      order_status: { $in: ["PENDING", "PROCESSING"] },
    });

    if (!order) {
      throw new BadRequestResponse(
        "Cannot cancel this order. It may have already been processed."
      );
    }

    // Hoàn lại số lượng sản phẩm
    const rollbackPromises = order.order_products.map(async (shopOrder) => {
      for (const productItem of shopOrder.item_products) {
        // Tìm và cập nhật lại số lượng sản phẩm
        await product.findByIdAndUpdate(productItem.productId, {
          $inc: { product_quantity: +productItem.quantity },
        });
      }
    });

    // Chờ hoàn tất việc hoàn số lượng
    await Promise.all(rollbackPromises);

    // Cập nhật trạng thái đơn hàng
    const updatedOrder = await orderModel.findOneAndUpdate(
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

    return updatedOrder;
  }
}

module.exports = CheckoutService;
