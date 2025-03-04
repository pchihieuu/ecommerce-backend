const express = require("express");

const { authenticationV2 } = require("../../auth/authUtils");

const { asyncHandler } = require("../../helpers/asyncHandler");
const checkoutController = require("../../controllers/checkout.controller");
const router = express.Router();

router.use(authenticationV2);
router.post(
  "/checkout-review",
  asyncHandler(checkoutController.checkoutReview)
);

router.post("/order", asyncHandler(checkoutController.orderByUser));
router.get("/", asyncHandler(checkoutController.getOrdersByUser));
router.get("/detail", asyncHandler(checkoutController.getOrderByUser));
router.patch("/cancel", asyncHandler(checkoutController.cancelOrderByUser));
router.patch(
  "/:orderId/update",

  asyncHandler(checkoutController.updateOrderByShop)
);
module.exports = router;
