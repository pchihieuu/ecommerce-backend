"use strict";

const {
  getProductById,
  updateProductRating,
} = require("../models/repository/product.repo");
const CommentRepository = require("../models/repository/comment.repo");
const {
  NotFoundResponse,
  ForbiddenResponse,
  BadRequestResponse,
} = require("../core/error.response");

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
    rating = null,
    parentCommentId = null,
  }) {
    // Validate product exists
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundResponse("Product not found");

    if (parentCommentId && rating) {
      throw new BadRequestResponse(
        "Rating can only by added to root comment, no replied comment",
      );
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      throw new BadRequestResponse("Rating must be between 1 and 5");
    }

    // Create comment payload
    const commentPayload = {
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
      rating: rating,
    };

    let rightValue;
    if (parentCommentId) {
      // Reply to comment
      const parentComment = await CommentRepository.findById(parentCommentId);
      if (!parentComment)
        throw new NotFoundResponse("Parent comment not found");
      if (parentComment.isDeleted)
        throw new NotFoundResponse("Cannot reply to a deleted comment");

      rightValue = parentComment.comment_right;

      // Update existing comments
      await CommentRepository.updateCommentsOnInsert(productId, rightValue);
    } else {
      // Root level comment
      const maxRightValue =
        await CommentRepository.findMaxRightValue(productId);
      rightValue = maxRightValue ? maxRightValue.comment_right + 1 : 1;
    }

    // Set left and right values for Nested Set Model
    commentPayload.comment_left = rightValue;
    commentPayload.comment_right = rightValue + 1;

    // Save comment
    const comment = await CommentRepository.createComment(commentPayload);

    if (rating !== null) {
      await this.updateProductRatingAverage(productId);
    }

    return comment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    // Validate product exists
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundResponse("Product not found");

    return await CommentRepository.getCommentsByParentId({
      productId,
      parentId: parentCommentId,
      limit,
      offset,
    });
  }

  static async updateComment({ commentId, userId, content, rating = null }) {
    // Check if comment exists and belongs to user
    const comment = await CommentRepository.findByIdAndUserId(
      commentId,
      userId,
    );
    if (!comment)
      throw new NotFoundResponse(
        "Comment not found or you don't have permission to update",
      );
    if (rating !== null && comment.comment_parentId) {
      throw new BadRequestResponse(
        "Rating can only by updated for root comments",
      );
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      throw new BadRequestResponse("Rating must be between 1 and 5");
    }
    const oldRating = comment.rating;

    // Update comment content
    const updatedComment = await CommentRepository.updateComment(
      commentId,
      content,
      rating,
    );

    if (
      (rating !== null && oldRating !== null) ||
      (oldRating !== null && rating === null)
    ) {
      await this.updateProductRatingAverage(comment.comment_productId);
    }

    return updatedComment;
  }

  static async getProductRatingSummary(productId) {
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundResponse("Product not found");

    const averageInfo =
      await CommentRepository.getAverageRatingByProductId(productId);

    const distribution =
      await CommentRepository.getRatingDistribution(productId);

    const formattedDistribution = Array.from({ length: 5 }, (_, i) => {
      const starCount = i + 1;
      const found = distribution.find((item) => item._id === starCount);
      return {
        stars: starCount,
        count: found ? found.count : 0,
      };
    }).reverse();

    return {
      averageRating: averageInfo.averageRating.toFixed(1),
      totalRatings: averageInfo.totalRatings,
      distribution: formattedDistribution,
    };
  }

  static async getCommentsByRating({
    productId,
    rating,
    limit = 50,
    offset = 0,
  }) {
    const product = await getProductById({ productId });
    if (!product) {
      throw new NotFoundResponse("Product not found");
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestResponse("Rating must be between 1 and 5");
    }

    return await CommentRepository.getCommentsByRating({
      productId,
      rating,
      limit,
      offset,
    });
  }

  static async deleteComment({ commentId, productId, userId }) {
    // Check if the product exists
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundResponse("Product not found");

    // Find the comment
    const comment = await CommentRepository.findById(commentId);
    if (!comment) throw new NotFoundResponse("Comment not found");

    // Authorization check - only comment owner can delete their own comment
    if (comment.comment_userId.toString() !== userId.toString()) {
      throw new ForbiddenResponse(
        "You don't have permission to delete this comment",
      );
    }

    const left = comment.comment_left;
    const right = comment.comment_right;
    const width = right - left + 1;

    // check if comment had a rating before delete
    const hadRating = comment.rating !== null;
    // Implement soft delete by setting isDeleted flag
    await CommentRepository.markCommentsAsDeleted(productId, left, right);

    // Update left and right values for remaining comments
    await CommentRepository.updateCommentsOnDelete(productId, left, width);

    // if deleted a hadRating, update product rating
    if (hadRating) {
      await this.updateProductRatingAverage(productId);
    }

    return true;
  }

  static async getCommentsByRatingRange({
    productId,
    minRating,
    maxRating,
    limit = 50,
    offset = 0,
  }) {
    const product = await getProductById({ productId });
    if (!product) {
      throw new NotFoundResponse("Product not found");
    }
  
    // Validate rating range
    if (minRating < 1 || maxRating > 5 || minRating > maxRating) {
      throw new BadRequestResponse("Invalid rating range. Must be between 1 and 5");
    }
  
    return await CommentRepository.getCommentsByRatingRange({
      productId,
      minRating: parseFloat(minRating),
      maxRating: parseFloat(maxRating),
      limit,
      offset,
    });
  }
  
  static async countComments(productId) {
    // Additional utility method to count comments for a product
    const product = await getProductById({ productId });
    if (!product) throw new NotFoundResponse("Product not found");

    return await CommentRepository.countByProductId(productId);
  }

  static async updateProductRatingAverage(productId) {
    const ratingInfo =
      await CommentRepository.getAverageRatingByProductId(productId);

    const averageRating = ratingInfo.averageRating || 4.5;

    await updateProductRating(productId, averageRating);

    return averageRating;
  }
}

module.exports = CommentService;
