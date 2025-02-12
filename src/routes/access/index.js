"use strict";

const express = require("express");
const router = express.Router();
const accessController = require('../../controllers/access.controller')
// signup
router.post("/shop/signup", accessController.signUp);

module.exports = router;
