"use strict";

const express = require("express");
const { authenticationV2 } = require("../../auth/authUtils");
const notificationController = require("../../controllers/notification.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");

const router = express.Router();

router.use(authenticationV2);

router.get("", asyncHandler(notificationController.getListNotiByUser));

module.exports = router;
