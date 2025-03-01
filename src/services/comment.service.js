"use strict";

const { convertToObjectId } = require("../utils");
const commentModel = require("../models/comment.model");
const { NotFoundRespone } = require("../core/error.respone");

/**
 * key features: Comment service
   + add comment [User, Shop]
   + get a list of comments [User, Shop]
   + delete a comment [Admin, Shop]
 * 
 */

class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const comment = new commentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      // reply comment
      const parentComment = await commentModel.findById(parentCommentId);
      if (!parentComment) throw new NotFoundRespone("Parent comment not found");
      rightValue = parentComment.comment_right;

      // updateMany comments
      await Promise.all([
        commentModel.updateMany(
          {
            comment_productId: convertToObjectId(productId),
            comment_right: { $gte: rightValue },
          },
          {
            $inc: { comment_right: 2 },
          }
        ),

        commentModel.updateMany(
          {
            comment_productId: convertToObjectId(productId),
            comment_left: { $gt: rightValue },
          },
          {
            $inc: { comment_left: 2 },
          }
        ),
      ]);
    } else {
      const maxRightValue = await commentModel.findOne(
        {
          comment_productId: convertToObjectId(productId),
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }

    // insert comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    await comment.save();
    return comment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (parentCommentId) {
      const parent = await commentModel.findById(parentCommentId);
      if (!parent) throw new NotFoundRespone("Not found comment for product");

      const comments = await commentModel
        .find({
          // comment_parentId: convertToObjectId(parentCommentId),
          comment_productId: convertToObjectId(productId),
          comment_left: { $gt: parent.comment_left },
          comment_right: { $lt: parent.comment_right },
        })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          // comment_userId: 1,
          comment_parentId: 1,
        })
        .skip(offset)
        .limit(limit)
        .sort({ comment_left: 1 });

      return comments;
    }
    const comments = await commentModel
      .find({
        comment_parentId: parentCommentId,
        comment_productId: convertToObjectId(productId),
      })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        // comment_userId: 1,
        comment_parentId: 1,
      })
      .skip(offset)
      .limit(limit)
      .sort({ comment_left: 1 });

    return comments;
  }
}

module.exports = CommentService;
