// "use strict";

// const { convertToObjectId } = require("../utils");
// const cartModel = require("../models/cart.model");
// const {
//   createUserCart,
//   updateCartItemQuantity,
//   removeItemFromCart,
// } = require("../models/repository/cart.repo");
// const { getProductById } = require("../models/repository/product.repo");
// const { NotFoundRespone } = require("../core/error.respone");

// /*

//     Key features: Cart service
//     - add product to cart [user]
//     - reduce product quantity be one [User]
//     - increase product quantity by One [User]
//     - get cart [User]
//     - Delete cart [User]
//     - Delete cart items [User]
//  */

// class CartService {
//   static async addToCart({ userId, product = {} }) {
//     // check cart ton tai khong?
//     const userCart = await cartModel.findOne({
//       cart_user_id: convertToObjectId(userId),
//     });
//     if (!userCart) {
//       // tao gio hang moi neu gio hang chua ton tai
//       return await createUserCart({
//         userId,
//         product,
//       });
//     }

//     // neu gio hang ton tai nhung chua co san pham thi them san pham
//     if (!userCart.cart_products.length) {
//       userCart.cart_products = [product];
//       return await userCart.save();
//     }

//     return await updateCartItemQuantity({
//       userId,
//       product,
//     });
//   }

//   static async updateCart({ userId, product = {} }) {
//     const { product_id, quantity, old_quantity } =
//       shop_order_ids[0]?.item_products[0];
//     const foundProduct = await getProductById({ productId: product_id });

//     if (!foundProduct) throw new NotFoundRespone("Product does not exists");

//     if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shop_id)
//       throw new NotFoundRespone("rPoduct does not belong to the shop");
//     if (quantity === 0) {
//       return await removeItemFromCart({
//         user_id: userId,
//         product_id,
//       });
//     }

//     return await updateCartItemQuantity({
//       userId,
//       product: {
//         product_id,
//         quantity: quantity - old_quantity,
//       },
//     });
//   }
//   static async getListProductsFromCart({ userId }) {
//     return await cartModel.findOne({
//       cart_user_id: convertToObjectId(userId),
//     });
//   }
//   static async removeItemFromCart({ user_id, product_id }) {
//     return await removeItemFromCart({
//       user_id,
//       product_id,
//     });
//   }
// }

// module.exports = CartService;

// "use strict";

// const { convertToObjectId } = require("../utils");
// const cartModel = require("../models/cart.model");
// const {
//   createUserCart,
//   updateCartItemQuantity,
//   removeItemFromCart,
// } = require("../models/repository/cart.repo");
// const { getProductById } = require("../models/repository/product.repo");
// const { NotFoundRespone } = require("../core/error.respone");

// class CartService {
//   static async addToCart({ userId, product = {} }) {
//     // Ensure product has consistent field names (product_id, shop_id)
//     const cartProduct = {
//       product_id: product.product_id || product.productId,
//       shop_id: product.shop_id || product.shopId,
//       quantity: product.quantity,
//       price: product.price,
//     };

//     // check cart ton tai khong?
//     const userCart = await cartModel.findOne({
//       cart_user_id: convertToObjectId(userId),
//     });

//     if (!userCart) {
//       // tao gio hang moi neu gio hang chua ton tai
//       return await createUserCart({
//         userId,
//         product: cartProduct,
//       });
//     }

//     // neu gio hang ton tai nhung chua co san pham thi them san pham
//     if (!userCart.cart_products.length) {
//       userCart.cart_products = [cartProduct];
//       return await userCart.save();
//     }

//     return await updateCartItemQuantity({
//       userId,
//       product: cartProduct,
//     });
//   }

//   static async updateCart({ userId, shop_order_ids }) {
//     if (!shop_order_ids || !shop_order_ids[0]) {
//       throw new NotFoundRespone("Invalid order data");
//     }

//     const { product_id, quantity, old_quantity } =
//       shop_order_ids[0]?.item_products[0];
//     const foundProduct = await getProductById({ productId: product_id });

//     if (!foundProduct) throw new NotFoundRespone("Product does not exists");

//     if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shop_id)
//       throw new NotFoundRespone("Product does not belong to the shop");

//     if (quantity === 0) {
//       return await removeItemFromCart({
//         user_id: userId,
//         product_id,
//       });
//     }

//     return await updateCartItemQuantity({
//       userId,
//       product: {
//         product_id,
//         quantity: quantity - old_quantity,
//       },
//     });
//   }

//   static async getListProductsFromCart({ userId }) {
//     return await cartModel.findOne({
//       cart_user_id: convertToObjectId(userId),
//     });
//   }

//   static async removeItemFromCart({ user_id, product_id }) {
//     return await removeItemFromCart({
//       user_id,
//       product_id,
//     });
//   }
// }

// module.exports = CartService;

"use strict";

const { convertToObjectId } = require("../utils");
const cartModel = require("../models/cart.model");
const {
  createUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
} = require("../models/repository/cart.repo");
const { getProductById } = require("../models/repository/product.repo");
const { NotFoundRespone } = require("../core/error.respone");

class CartService {
  static async addToCart({ userId, product = {} }) {
    // Extract product_id, regardless of whether it's called product_id or productId
    const productId = product.product_id || product.productId;

    if (!productId) {
      throw new NotFoundRespone("Product ID is required");
    }

    // Fetch the complete product details from database
    const foundProduct = await getProductById({ productId });

    if (!foundProduct) {
      throw new NotFoundRespone("Product not found");
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
      throw new NotFoundRespone("Invalid order data");
    }

    const { product_id, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];

    const foundProduct = await getProductById({ productId: product_id });

    if (!foundProduct) throw new NotFoundRespone("Product does not exist");

    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shop_id)
      throw new NotFoundRespone("Product does not belong to the shop");

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
}

module.exports = CartService;
