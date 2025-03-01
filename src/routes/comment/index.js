"use strict";

const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const commentController = require("../../controllers/comment.controller");
const router = express.Router();

router.use(authenticationV2);

router.post("/create", asyncHandler(commentController.createComment));
router.get("/get-list", asyncHandler(commentController.getCommentsByParentId));
// router.delete("/delete", asyncHandler(discountController.deleteDiscount));
// router.patch("/cancel", asyncHandler(discountController.cancelDiscount));
// router.patch("/update", asyncHandler(discountController.updateDiscount));

module.exports = router;
