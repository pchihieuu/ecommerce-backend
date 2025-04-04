"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/list_product_code",
  asyncHandler(discountController.getAllDiscountCodeWithProducts)
);

router.post("/amount", asyncHandler(discountController.getDiscountAmount));

router.use(authenticationV2);

router.post("/create", asyncHandler(discountController.createDiscountCode));
router.get("/get-all", asyncHandler(discountController.getAllDiscountCodes));
router.delete("/delete", asyncHandler(discountController.deleteDiscount));
router.patch("/cancel", asyncHandler(discountController.cancelDiscount));
router.patch("/update", asyncHandler(discountController.updateDiscount));

module.exports = router;
