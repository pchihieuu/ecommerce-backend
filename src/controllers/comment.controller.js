"use strict";

const { SuccessResponse } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  async createComment(req, res, next) {
    // Add userId from authenticated user
    const { productId, content, parentCommentId } = req.body;

    new SuccessResponse({
      message: "Create comment successful!",
      metadata: await CommentService.createComment({
        productId,
        userId: req.user.userId,
        content,
        parentCommentId,
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
    const { commentId, content } = req.body;

    new SuccessResponse({
      message: "Update comment successful!",
      metadata: await CommentService.updateComment({
        commentId,
        userId: req.user.userId,
        content,
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

  async countComments(req, res, next) {
    const { productId } = req.query;

    new SuccessResponse({
      message: "Count comments successful!",
      metadata: await CommentService.countComments(productId),
    }).send(res);
  }
}

module.exports = new CommentController();
