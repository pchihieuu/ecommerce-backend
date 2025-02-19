"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const productController = require("../../controllers/product.controller");

router.get(
  "/search/:keySearch",
  asyncHandler(productController.searchProductsByUser)
);
router.get("/all", asyncHandler(productController.getAllProducts));
router.get("/detail/:id", asyncHandler(productController.getDetailProduct));

// authentication
router.use(authenticationV2);
// create product
router.post("/create", asyncHandler(productController.createProduct));
router.post("/publish/:id", asyncHandler(productController.publishProduct));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProduct));

router.get("/drafts/all", asyncHandler(productController.getAllDraftProducts));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishedProducts)
);
router.patch(
  "/:product_id",
  asyncHandler(productController.updateProduct)
);
module.exports = router;
