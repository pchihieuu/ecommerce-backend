"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const productController = require("../../controllers/product.controller");

// authentication
router.use(authenticationV2);
// create product
router.post("/create", asyncHandler(productController.createProduct));

module.exports = router;
