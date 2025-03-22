"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const userController = require("../../controllers/user.controller");

router.post("/new", asyncHandler(userController.newUser));
router.post(
  "/verify-email",
  asyncHandler(userController.checkRegisterEmailToken)
);

module.exports = router;
