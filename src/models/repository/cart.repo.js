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

  return await cartModel.findByIdAndUpdate(query, updateOrInsert, options);
};

const updateCartItemQuantity = async ({ userId, product }) => {
  const { product_id, quantity } = product;
  const query = {
    cart_user_id: userId,
    "cart_products.product_id": product_id,
    cart_state: "ACTIVE",
  };

  const updateSet = {
    $inc: {
      "cart_products.$.quantity": quantity,
    },
  };
  const options = {
    new: true,
    upsert: true,
  };
  return await cartModel.findOneAndUpdate(query, updateSet, options);
};

module.exports = {
  createUserCart,
  updateCartItemQuantity,
};
