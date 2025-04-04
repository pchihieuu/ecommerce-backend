"use strict";

const express = require("express");
const { profiles, profile } = require("../../controllers/profile.controller");
const { grantAccess } = require("../../middlewares/rbac.middleware");
const router = express.Router();
// admin
router.get("/view-any", grantAccess("readAny", "profile"), profiles);
// shop
router.get("/view-own", grantAccess("readOwn", "profile"), profile);
// user
module.exports = router;
