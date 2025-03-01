"use strict";

const { getProductById } = require("../models/repository/product.repo");
const CommentRepository = require("../models/repository/comment.repo");
const { NotFoundRespone, ForbiddenRespone } = require("../core/error.respone");

/**
 * Key features: Comment service
 * + add comment [User, Shop]
 * + get a list of comments [User, Shop]
 * + update comment [User - only own comments]
 * + delete a comment [User - only own comments]
 * + soft delete vs hard delete comments
 */

class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    // Validate product exists
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundRespone("Product not found");

    // Create comment payload
    const commentPayload = {
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    };

    let rightValue;
    if (parentCommentId) {
      // Reply to comment
      const parentComment = await CommentRepository.findById(parentCommentId);
      if (!parentComment) throw new NotFoundRespone("Parent comment not found");
      if (parentComment.isDeleted)
        throw new NotFoundRespone("Cannot reply to a deleted comment");

      rightValue = parentComment.comment_right;

      // Update existing comments
      await CommentRepository.updateCommentsOnInsert(productId, rightValue);
    } else {
      // Root level comment
      const maxRightValue = await CommentRepository.findMaxRightValue(
        productId
      );
      rightValue = maxRightValue ? maxRightValue.comment_right + 1 : 1;
    }

    // Set left and right values for Nested Set Model
    commentPayload.comment_left = rightValue;
    commentPayload.comment_right = rightValue + 1;

    // Save comment
    return await CommentRepository.createComment(commentPayload);
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    // Validate product exists
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundRespone("Product not found");

    return await CommentRepository.getCommentsByParentId({
      productId,
      parentId: parentCommentId,
      limit,
      offset,
    });
  }

  static async updateComment({ commentId, userId, content }) {
    // Check if comment exists and belongs to user
    const comment = await CommentRepository.findByIdAndUserId(
      commentId,
      userId
    );
    if (!comment)
      throw new NotFoundRespone(
        "Comment not found or you don't have permission to update"
      );

    // Update comment content
    return await CommentRepository.updateComment(commentId, content);
  }

  static async deleteComment({ commentId, productId, userId }) {
    // Check if the product exists
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundRespone("Product not found");

    // Find the comment
    const comment = await CommentRepository.findById(commentId);
    if (!comment) throw new NotFoundRespone("Comment not found");

    // Authorization check - only comment owner can delete their own comment
    if (comment.comment_userId.toString() !== userId.toString()) {
      throw new ForbiddenRespone(
        "You don't have permission to delete this comment"
      );
    }

    const left = comment.comment_left;
    const right = comment.comment_right;
    const width = right - left + 1;

    // Implement soft delete by setting isDeleted flag
    await CommentRepository.markCommentsAsDeleted(productId, left, right);

    // Update left and right values for remaining comments
    await CommentRepository.updateCommentsOnDelete(productId, left, width);

    return true;
  }

  static async countComments(productId) {
    // Additional utility method to count comments for a product
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundRespone("Product not found");

    return await CommentRepository.countByProductId(productId);
  }
}

module.exports = CommentService;
