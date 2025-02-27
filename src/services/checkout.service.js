// "use strict";

// const { checkProductByServer } = require("../models/repository/product.repo");
// const { BadRequestRespone } = require("../core/error.respone");
// const { findCartById } = require("../models/repository/cart.repo");
// const { getDiscountAmount } = require("./discount.service");

// class CheckoutService {
//   /*
//         {
//             cartId,
//             userId,
//             shop_order_ids: [
//                 {
//                     shopId:
//                     shop_discount: [
//                         "shopId",
//                         "discountId",
//                         "code"
//                     ],
//                     item_products: [
//                         price,
//                         quantity,
//                         productId
//                     ]
//                 }
//             ]
//         }
//      */
//   static async checkoutReview({ cartId, userId, shop_order_ids }) {
//     const foundCart = await findCartById(cartId);
//     if (!foundCart) throw new BadRequestRespone("Cart does not exists");

//     const checkout_order = {
//         totalPrice: 0,
//         feeShip: 0,
//         totalDiscount: 0,
//         totalCheckout: 0,
//       },
//       shop_order_ids_new = [];

//     // tinh tong tien bill
//     for (let i = 0; i < shop_order_ids.length; i++) {
//       const {
//         shopId,
//         shop_discounts = [],
//         item_products = [],
//       } = shop_order_ids[i];
//       // check product hop le hay khong?
//       const checkProduct = await checkProductByServer(item_products);
//       console.log(`checkproduct:: `, checkProduct);
//       if (!checkProduct[0]) throw new BadRequestRespone("Order wrong!");

//       // tong tien don hang
//       const checkoutPrice = checkProduct.reduce((total, product) => {
//         return total + product.quantity * product.price;
//       }, 0);
//       // tong tien truoc khi xu ly
//       checkout_order.totalPrice += checkoutPrice;

//       const itemCheckout = {
//         shopId,
//         shop_discounts,
//         priceRaw: checkoutPrice, // tien truoc khi giam gia
//         priceApplyDiscount: checkoutPrice,
//         item_products: checkProduct,
//       };

//       // neu shop_discounts ton tai > 0, check xem co hop le hay khong
//       if (shop_discounts.length > 0) {
//         // gia su chi co 1 discount
//         const { totalOrder, amount, total_price } = await getDiscountAmount({
//           code: shop_discounts[0].code,
//           userId,
//           shopId,
//           products: checkProduct,
//         });
//         // tong cong discount giam gia
//         checkout_order.totalDiscount += discount;

//         // neu tien giam gia > 0
//         if (amount > 0) {
//           itemCheckout.priceApplyDiscount = checkoutPrice - amount;
//         }
//       }

//       // tong thanh toan cuoi cung
//       checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
//       shop_order_ids_new.push(itemCheckout);
//     }
//     return {
//       shop_order_ids,
//       shop_order_ids_new,
//       checkout_order,
//     };
//   }
// }

// module.exports = CheckoutService;

// "use strict";

// const { checkProductByServer } = require("../models/repository/product.repo");
// const { BadRequestRespone } = require("../core/error.respone");
// const { findCartById } = require("../models/repository/cart.repo");
// const { getDiscountAmount } = require("./discount.service");

// class CheckoutService {
//   /*
//         {
//             cartId,
//             userId,
//             shop_order_ids: [
//                 {
//                     shopId:
//                     shop_discounts: [
//                         {
//                             shopId,
//                             discountId,
//                             code
//                         }
//                     ],
//                     item_products: [
//                         {
//                             price,
//                             quantity,
//                             productId
//                         }
//                     ]
//                 }
//             ]
//         }
//      */
//   static async checkoutReview({ cartId, userId, shop_order_ids }) {
//     // Validate cart exists
//     const foundCart = await findCartById(cartId);
//     if (!foundCart) throw new BadRequestRespone("Cart does not exist");

//     // Initialize checkout data structures
//     const checkout_order = {
//         totalPrice: 0, // Raw total before discount
//         feeShip: 0, // Shipping fee
//         totalDiscount: 0, // Total discount amount
//         totalCheckout: 0, // Final price after discount
//       },
//       shop_order_ids_new = []; // Transformed order information

//     // Process each shop's order
//     for (let i = 0; i < shop_order_ids.length; i++) {
//       const {
//         shopId,
//         shop_discounts = [],
//         item_products = [],
//       } = shop_order_ids[i];

//       // Check if products are valid
//       const checkProduct = await checkProductByServer(item_products);

//       // Validate all products were found
//       if (!checkProduct.length || checkProduct.includes(undefined)) {
//         throw new BadRequestRespone(
//           "One or more products in your order are invalid!"
//         );
//       }

//       // Calculate total raw price for this shop's items
//       const checkoutPrice = checkProduct.reduce((total, product) => {
//         return total + product.quantity * product.price;
//       }, 0);

//       // Add to overall total price
//       checkout_order.totalPrice += checkoutPrice;

//       // Initialize shop checkout data with default values
//       const itemCheckout = {
//         shopId,
//         shop_discounts,
//         priceRaw: checkoutPrice, // Price before discount
//         priceApplyDiscount: checkoutPrice, // Default to raw price if no discount
//         item_products: checkProduct,
//       };

//       // Process discounts if available
//       if (shop_discounts.length > 0) {
//         try {
//           // Get discount info from discount service
//           const { totalOrder, amount, total_price } = await getDiscountAmount({
//             code: shop_discounts[0].code,
//             userId,
//             shopId,
//             products: checkProduct,
//           });

//           // Update total discount amount
//           checkout_order.totalDiscount += amount;

//           // Apply discount to shop total if valid
//           if (amount > 0) {
//             itemCheckout.priceApplyDiscount = checkoutPrice - amount;
//           }
//         } catch (error) {
//           // Log discount error but continue checkout process
//           console.error(`Discount error: ${error.message}`);
//           // Keep the original price (already set as default)
//         }
//       }

//       // Add this shop's final price to total checkout amount
//       checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;

//       // Add processed shop order to results
//       shop_order_ids_new.push(itemCheckout);
//     }

//     // Return all checkout information
//     return {
//       shop_order_ids, // Original order info
//       shop_order_ids_new, // Processed order info with pricing
//       checkout_order, // Summary of all pricing
//     };
//   }
// }

// module.exports = CheckoutService;

"use strict";

const { checkProductByServer } = require("../models/repository/product.repo");
const { BadRequestRespone } = require("../core/error.respone");
const { findCartById } = require("../models/repository/cart.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const orderModel = require("../models/order.model");
const { removeAllProductsFromCart } = require("./cart.service");

class CheckoutService {
  /*
        {
            cartId,
            userId,
            shop_order_ids: [
                {
                    shopId:
                    shop_discounts: [
                        {
                            shopId,
                            discountId,
                            code
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ],
                    feeShip: 0 // Phí vận chuyển cho shop này
                }
            ]
        }
     */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // Validate cart exists
    const foundCart = await findCartById(cartId);
    if (!foundCart) throw new BadRequestRespone("Cart does not exist");

    // Initialize checkout data structures
    const checkout_order = {
        totalPrice: 0, // Raw total before discount
        feeShip: 0, // Tổng phí vận chuyển
        totalDiscount: 0, // Total discount amount
        totalCheckout: 0, // Final price after discount and shipping
      },
      shop_order_ids_new = []; // Transformed order information

    // Process each shop's order
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
        feeShip = 0, // Default to 0 if not provided
      } = shop_order_ids[i];

      // Check if products are valid
      const checkProduct = await checkProductByServer(item_products);

      // Validate all products were found
      if (!checkProduct.length || checkProduct.includes(undefined)) {
        throw new BadRequestRespone(
          "One or more products in your order are invalid!"
        );
      }

      // Calculate total raw price for this shop's items
      const checkoutPrice = checkProduct.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0);

      // Add to overall total price
      checkout_order.totalPrice += checkoutPrice;

      // Add shipping fee to total
      checkout_order.feeShip += feeShip;

      // Initialize shop checkout data with default values
      const itemCheckout = {
        shopId,
        shop_discounts,
        feeShip, // Include shipping fee for this shop
        priceRaw: checkoutPrice, // Price before discount
        priceApplyDiscount: checkoutPrice, // Default to raw price if no discount
        item_products: checkProduct,
      };

      // Process discounts if available
      if (shop_discounts.length > 0) {
        try {
          // Get discount info from discount service
          const { totalOrder, amount, total_price } = await getDiscountAmount({
            code: shop_discounts[0].code,
            userId,
            shopId,
            products: checkProduct,
          });

          // Update total discount amount
          checkout_order.totalDiscount += amount;

          // Apply discount to shop total if valid
          if (amount > 0) {
            itemCheckout.priceApplyDiscount = checkoutPrice - amount;
          }
        } catch (error) {
          // Log discount error but continue checkout process
          console.error(`Discount error: ${error.message}`);
          // Keep the original price (already set as default)
        }
      }

      // Add this shop's final price to total checkout amount (with shipping)
      checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;

      // Add processed shop order to results
      shop_order_ids_new.push(itemCheckout);
    }

    // Add total shipping fee to final checkout amount
    checkout_order.totalCheckout += checkout_order.feeShip;

    // Return all checkout information
    return {
      shop_order_ids, // Original order info
      shop_order_ids_new, // Processed order info with pricing
      checkout_order, // Summary of all pricing
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
    // check lai 1 lan nua xem vuot ton kho hay khong?
    // get new array product
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    console.log(`[1]::`, products);
    const acquireProduct = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyClock = await acquireLock({ productId, quantity, cartId });
      acquireProduct.push(keyClock ? true : false);

      if (keyClock) {
        await releaseLock(keyClock);
      }
    }
    // neu co 1 san pham het hang trong kho?
    if (acquireProduct.includes(false)) {
      throw new BadRequestRespone(
        "Some products have been updated, please return to the cart"
      );
    }
    // Neu thanh cong het => tao mot new order
    const newOrder = await orderModel.create({
      order_user_id: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });

    // await newOrder.save();
    // neu insert thanh cong thi remove product co trong cart
    if (newOrder) {
      // remove product in mycart
      await removeAllProductsFromCart({ cartId, userId });
    }

    return newOrder;
  }
  

  
  // User lay nhieu order da dat
  
  
  static async getOrdersByUser({}) {}

  // User lay mot order da dat
  static async getOrderByUser({}) {}

  // User cancel order
  static async cancelOrderByUser({}) {}

  // Cap nhat order
  // Luu y: Cap nhat status van chuyen la do he thong + 3rd-party chu khong phai do shop
  static async updateOrderByShop({}) {}
}

module.exports = CheckoutService;
