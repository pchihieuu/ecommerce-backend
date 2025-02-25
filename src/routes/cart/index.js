const express = require("express");

const { authenticationV2 } = require("../../auth/authUtils");
const cartController = require("../../controllers/cart.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();
router.use(authenticationV2);
router.get(
  "/get-list-products/:id",
  asyncHandler(cartController.getListProductsFromCart)
);
router.post("/add-to-cart", asyncHandler(cartController.addToCart));
router.patch("/update-quantity", asyncHandler(cartController.updateCart));
router.delete(
  "/remove-item-from-cart",
  asyncHandler(cartController.removeItemFromCart)
);

module.exports = router;
