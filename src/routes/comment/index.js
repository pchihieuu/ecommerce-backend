"use strict";

const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const commentController = require("../../controllers/comment.controller");
const router = express.Router();

router.get("/get-list", asyncHandler(commentController.getCommentsByParentId));
router.get("/count", asyncHandler(commentController.countComments));

router.get(
  "/ratings/summary",
  asyncHandler(commentController.getProductRatingSummary),
);
router.get(
  "/ratings/range",
  asyncHandler(commentController.getCommentsByRatingRange)
);
router.get(
  "/ratings/filter",
  asyncHandler(commentController.getCommentsByRating),
);

router.use(authenticationV2);

router.post("/create", asyncHandler(commentController.createComment));
router.patch("/update", asyncHandler(commentController.updateComment));
router.delete("/delete", asyncHandler(commentController.deleteComment));

module.exports = router;
