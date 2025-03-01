"use strict";

const { SuccessRespone } = require("../core/success.respone");
const CommentService = require("../services/comment.service");

class CommentController {
  async createComment(req, res, next) {
    new SuccessRespone({
      message: "Create comment successful !",
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  }
  async getCommentsByParentId(req, res, next) {
    new SuccessRespone({
      message: "List comment product",
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  }
}

module.exports = new CommentController();
