"use strict";

const express = require("express");
const router = express.Router();
const { authenticationV2 } = require("../../auth/authUtils");
const templateController = require("../../controllers/template.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
router.use(authenticationV2);

router.post("/create", asyncHandler(templateController.createTemplate));

module.exports = router;
