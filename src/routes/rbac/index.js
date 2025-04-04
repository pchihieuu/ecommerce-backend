"use strict";

const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const rbacController = require("../../controllers/rbac.controller");
const router = express.Router();

router.use(authenticationV2);

router.post("/create-new-role", asyncHandler(rbacController.createNewRole));
router.post(
  "/create-new-resource",
  asyncHandler(rbacController.createNewResource)
);

router.get("/list-roles", asyncHandler(rbacController.getRoleList));
router.get("/list-resources", asyncHandler(rbacController.getResourceList));
module.exports = router;
