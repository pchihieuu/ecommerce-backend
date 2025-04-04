'use strict';

const { convertToObjectId } = require("../../utils");
const cartModel = require("../cart.model");

const createUserCart = async ({ userId, product }) => {
  const query = { cart_user_id: userId, cart_state: "ACTIVE" };
  const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
    },
    options = {
      upsert: true,
      new: true,
    };

  return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
};

const updateCartItemQuantity = async ({ userId, product }) => {
  // Extract product_id and quantity
  const product_id = product.product_id;
  const quantity = product.quantity;

  // First check if the product exists in the cart
  const userCart = await cartModel.findOne({
    cart_user_id: userId,
    "cart_products.product_id": product_id,
    cart_state: "ACTIVE",
  });

  // If the product exists in the cart, update its quantity
  if (userCart) {
    const query = {
        cart_user_id: userId,
        "cart_products.product_id": product_id,
        cart_state: "ACTIVE",
      },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity,
        },
      };
    const options = { new: true };
    return await cartModel.findOneAndUpdate(query, updateSet, options);
  }
  // If the product doesn't exist in the cart, add it with complete details
  else {
    const query = {
        cart_user_id: userId,
        cart_state: "ACTIVE",
      },
      updateSet = {
        $push: {
          cart_products: {
            product_id: product_id,
            quantity: quantity,
            price: product.price,
            name: product.name, // Include product name in cart
            shop_id: product.shop_id,
          },
        },
      };
    const options = { new: true, upsert: true };
    return await cartModel.findOneAndUpdate(query, updateSet, options);
  }
};

const removeItemFromCart = async ({ user_id, product_id }) => {
  const query = {
    cart_user_id: user_id,
    "cart_products.product_id": product_id,
    cart_state: "ACTIVE",
  };
  const updateSet = {
    $pull: {
      cart_products: { product_id },
    },
  };
  const deleted = await cartModel.updateOne(query, updateSet);
  return deleted;
};

const findCartById = async (cartId) => {
  return await cartModel
    .findOne({
      _id: convertToObjectId(cartId),
      cart_state: "ACTIVE",
    })
    .lean();
};

module.exports = {
  createUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
  findCartById,
};
