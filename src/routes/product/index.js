"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const productController = require("../../controllers/product.controller");
const { uploadToMemory } = require("../../configs/multer.config");
const {
  readCache,
  validateSkuParams,
  validateSpuParams,
  readCacheSkuList,
} = require("../../middlewares/cache.middleware");
router.get(
  "/search/:keySearch",
  asyncHandler(productController.searchProductsByUser)
);
router.get("/all", asyncHandler(productController.getAllProducts));
router.get("/detail/:id", asyncHandler(productController.getDetailProduct));
router.get(
  "/sku",
  validateSkuParams,
  readCache,
  asyncHandler(productController.getDetailSku)
);
router.get(
  "/sku/listBySpuId",
  validateSpuParams,
  readCacheSkuList,
  asyncHandler(productController.getListSkuBySpuId)
);

// authentication
router.use(authenticationV2);

router.get("/spu", asyncHandler(productController.getDetailSpu));
router.post("/spu/create", asyncHandler(productController.createNewSpu));
router.post(
  "/create",
  uploadToMemory.single("product_thumb"),
  asyncHandler(productController.createProduct)
);

router.post("/publish/:id", asyncHandler(productController.publishProduct));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProduct));

router.get("/drafts/all", asyncHandler(productController.getAllDraftProducts));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishedProducts)
);
router.patch("/:product_id", asyncHandler(productController.updateProduct));
module.exports = router;
