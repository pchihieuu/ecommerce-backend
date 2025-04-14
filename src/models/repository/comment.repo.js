"use strict";

const { convertToObjectId } = require("../../utils");
const commentModel = require("../comment.model");
const { NotFoundResponse } = require("../../core/error.response");

class CommentRepository {
  static async createComment(payload) {
    const comment = new commentModel(payload);
    return await comment.save();
  }

  static async findById(commentId) {
    return await commentModel.findById(commentId);
  }

  static async findByIdAndUserId(commentId, userId) {
    return await commentModel.findOne({
      _id: convertToObjectId(commentId),
      comment_userId: convertToObjectId(userId),
      isDeleted: false,
    });
  }

  // static async getCommentsByParentId({
  //   productId,
  //   parentId = null,
  //   limit = 50,
  //   offset = 0,
  // }) {
  //   if (parentId) {
  //     const parent = await this.findById(parentId);
  //     if (!parent) throw new NotFoundResponse("Parent comment not found");

  //     return await commentModel
  //       .find({
  //         comment_productId: convertToObjectId(productId),
  //         comment_left: { $gt: parent.comment_left },
  //         comment_right: { $lt: parent.comment_right },
  //         isDeleted: false,
  //       })
  //       .select({
  //         comment_left: 1,
  //         comment_right: 1,
  //         comment_content: 1,
  //         comment_userId: 1,
  //         comment_parentId: 1,
  //         createdAt: 1,
  //         updatedAt: 1,
  //       })
  //       .populate("comment_userId", "name email")
  //       .skip(offset)
  //       .limit(limit)
  //       .sort({ comment_left: 1 });
  //   }

  //   return await commentModel
  //     .find({
  //       comment_parentId: parentId,
  //       comment_productId: convertToObjectId(productId),
  //       isDeleted: false,
  //     })
  //     .select({
  //       comment_left: 1,
  //       comment_right: 1,
  //       comment_content: 1,
  //       comment_userId: 1,
  //       comment_parentId: 1,
  //       createdAt: 1,
  //       updatedAt: 1,
  //     })
  //     .populate("comment_userId", "name email")
  //     .skip(offset)
  //     .limit(limit)
  //     .sort({ comment_left: 1 });
  // }

  static async findMaxRightValue(productId) {
    return await commentModel.findOne(
      {
        comment_productId: convertToObjectId(productId),
      },
      "comment_right",
      { sort: { comment_right: -1 } }
    );
  }

  static async updateCommentsOnInsert(productId, rightValue) {
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
  }

  static async updateCommentsOnDelete(productId, left, width) {
    await Promise.all([
      commentModel.updateMany(
        {
          comment_productId: convertToObjectId(productId),
          comment_right: { $gt: left + width },
        },
        {
          $inc: { comment_right: -width },
        }
      ),

      commentModel.updateMany(
        {
          comment_productId: convertToObjectId(productId),
          comment_left: { $gt: left },
        },
        {
          $inc: { comment_left: -width },
        }
      ),
    ]);
  }

  static async markCommentsAsDeleted(productId, left, right) {
    return await commentModel.updateMany(
      {
        comment_productId: convertToObjectId(productId),
        comment_left: { $gte: left, $lte: right },
      },
      {
        isDeleted: true,
      }
    );
  }

  static async updateComment(commentId, content) {
    return await commentModel.findByIdAndUpdate(
      commentId,
      {
        comment_content: content,
      },
      { new: true }
    );
  }

  static async countByProductId(productId) {
    return await commentModel.countDocuments({
      comment_productId: convertToObjectId(productId),
      isDeleted: false,
    });
  }


  static async getAverageRatingByProductId(productId) {
    const result = await commentModel.aggregate([
      {
        $match: {
          comment_productId: convertToObjectId(productId),
          rating: { $ne: null },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: "$comment_productId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    
    return result.length > 0 ? result[0] : { averageRating: 0, totalRatings: 0 };
  }

  static async getRatingDistribution(productId) {
    return await commentModel.aggregate([
      {
        $match: {
          comment_productId: convertToObjectId(productId),
          rating: { $ne: null },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);
  }

  static async getCommentsByRating({
    productId,
    rating,
    limit = 50,
    offset = 0,
  }) {
    return await commentModel
      .find({
        comment_productId: convertToObjectId(productId),
        rating: rating,
        isDeleted: false,
      })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_userId: 1,
        comment_parentId: 1,
        rating: 1,
        images: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .populate("comment_userId", "name email")
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 });
  }
  
  static async getCommentsByParentId({
    productId,
    parentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (parentId) {
      const parent = await this.findById(parentId);
      if (!parent) throw new NotFoundResponse("Parent comment not found");

      return await commentModel
        .find({
          comment_productId: convertToObjectId(productId),
          comment_left: { $gt: parent.comment_left },
          comment_right: { $lt: parent.comment_right },
          isDeleted: false,
        })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_userId: 1,
          comment_parentId: 1,
          rating: 1,
          images: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .populate("comment_userId", "name email")
        .skip(offset)
        .limit(limit)
        .sort({ comment_left: 1 });
    }

    return await commentModel
      .find({
        comment_parentId: parentId,
        comment_productId: convertToObjectId(productId),
        isDeleted: false,
      })
      .select({
        comment_left: 1,
        comment_right: 1,
        comment_content: 1,
        comment_userId: 1,
        comment_parentId: 1,
        rating: 1,
        images: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .populate("comment_userId", "name email")
      .skip(offset)
      .limit(limit)
      .sort({ comment_left: 1 });
  }
}

module.exports = CommentRepository;
