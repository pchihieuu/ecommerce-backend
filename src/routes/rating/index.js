"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const ratingController = require("../../controllers/rating.controller");
const { uploadToMemory } = require("../../configs/multer.config");

router.get(
  "/product/:productId",
  asyncHandler(ratingController.getProductRatings),
);

router.use(authenticationV2);

router.post(
  "/product/:productId",
  uploadToMemory.array("rating_images", 5),
  asyncHandler(ratingController.createProductRating),
);

router.patch(
  "/:ratingId",
  uploadToMemory.array("rating_images", 5),
  asyncHandler(ratingController.updateProductRating),
);

router.delete("/:ratingId", asyncHandler(ratingController.deleteProductRating));

router.get("/shop/:shopId", asyncHandler(ratingController.getShopRatings));

module.exports = router;
