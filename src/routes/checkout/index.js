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

module.exports = router;
