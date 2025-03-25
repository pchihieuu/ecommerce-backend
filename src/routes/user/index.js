"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const userController = require("../../controllers/user.controller");
const { authenticationV2 } = require("../../auth/authUtils");

router.post("/new", asyncHandler(userController.newUser));
router.post(
  "/verify-email",
  asyncHandler(userController.checkRegisterEmailToken)
);
router.post("/login", asyncHandler(userController.login));

router.use(authenticationV2);
router.post("/logout", asyncHandler(userController.logout));
module.exports = router;
