"use strict";

const express = require("express");
const router = express.Router();
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
// signup
router.post("/shop/signup", asyncHandler(accessController.signUp));
// login
router.post("/shop/login", asyncHandler(accessController.signIn));

// authentication
router.use(authenticationV2);
// logout
router.post("/shop/logout", asyncHandler(accessController.logOut));
// handleRefreshToken
router.post("/shop/refresh-token", asyncHandler(accessController.refreshToken));

module.exports = router;
