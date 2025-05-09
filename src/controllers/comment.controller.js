"use strict";

const { SuccessResponse } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  async createComment(req, res, next) {
    // Add userId from authenticated user
    const { productId, content, parentCommentId, rating } = req.body;

    new SuccessResponse({
      message: "Create comment successful!",
      metadata: await CommentService.createComment({
        productId,
        userId: req.user.userId,
        content,
        parentCommentId,
        rating: rating ? Number(rating) : null,
      }),
    }).send(res);
  }

  async getCommentsByParentId(req, res, next) {
    new SuccessResponse({
      message: "List comments for product",
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  }

  async updateComment(req, res, next) {
    const { commentId, content, rating } = req.body;

    new SuccessResponse({
      message: "Update comment successful!",
      metadata: await CommentService.updateComment({
        commentId,
        userId: req.user.userId,
        content,
        rating: rating ? Number(rating) : undefined,
      }),
    }).send(res);
  }

  async getProductRatingSummary(req, res, next) {
    const { productId } = req.query;

    new SuccessResponse({
      message: "Get rating summary for product successfully",
      metadata: await CommentService.getProductRatingSummary(productId),
    }).send(res);
  }

  async getCommentsByRating(req, res, next) {
    const { productId, rating, limit, offset } = req.query;
    new SuccessResponse({
      message: "Get comment by rating successfully",
      metadata: await CommentService.getCommentsByRating({
        productId,
        rating: rating,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      }),
    }).send(res);
  }

  async deleteComment(req, res, next) {
    const { commentId, productId } = req.body;

    new SuccessResponse({
      message: "Delete comment successful!",
      metadata: await CommentService.deleteComment({
        commentId,
        productId,
        userId: req.user.userId,
      }),
    }).send(res);
  }

  async getCommentsByRatingRange(req, res, next) {
    const { productId, minRating, maxRating, limit, offset } = req.query;
    
    new SuccessResponse({
      message: "Get comments by rating range successfully",
      metadata: await CommentService.getCommentsByRatingRange({
        productId,
        minRating: parseFloat(minRating || 1),
        maxRating: parseFloat(maxRating || 5),
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      }),
    }).send(res);
  }

  async countComments(req, res, next) {
    const { productId } = req.query;

    new SuccessResponse({
      message: "Count comments successful!",
      metadata: await CommentService.countComments(productId),
    }).send(res);
  }
}

module.exports = new CommentController();
