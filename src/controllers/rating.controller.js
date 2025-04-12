"use strict";

const { CREATED, OK, SuccessResponse } = require("../core/success.response");
const RatingService = require("../services/rating.service");

class RatingController {
  // Create a new rating
  createProductRating = async (req, res, next) => {
    new CREATED({
      message: "Rating created successfully",
      metadata: await RatingService.createProductRating({
        userId: req.user.userId,
        productId: req.params.productId,
        content: req.body.content,
        ratingValue: req.body.rating_value,
        files: req.files,
      }),
    }).send(res);
  };

  // Update an existing rating
  updateProductRating = async (req, res, next) => {
    const { content, rating_value } = req.body;
    const files = req.files || [];
    new SuccessResponse({
      message:
        files.length > 0
          ? "Rating and images updated successfully"
          : "Rating updated successfully",
      metadata: await RatingService.updateProductRating({
        userId: req.user.userId,
        ratingId: req.params.ratingId,
        content,
        ratingValue: rating_value,
        files,
      }),
    }).send(res);
  };

  // Delete a rating
  deleteProductRating = async (req, res, next) => {
    new SuccessResponse({
      message: "Rating deleted successfully",
      metadata: await RatingService.deleteProductRating({
        userId: req.user.userId,
        ratingId: req.params.ratingId,
      }),
    }).send(res);
  };

  // Get ratings for a product
  getProductRatings = async (req, res, next) => {
    new SuccessResponse({
      message: "Product ratings retrieved successfully",
      metadata: await RatingService.getProductRatings({
        productId: req.params.productId,
        limit: parseInt(req.query.limit) || 50,
        page: parseInt(req.query.page) || 1,
        sort: req.query.sort || "ctime",
      }),
    }).send(res);
  };

  // Get ratings for a shop
  getShopRatings = async (req, res, next) => {
    new SuccessResponse({
      message: "Shop ratings retrieved successfully",
      metadata: await RatingService.getShopRatings({
        shopId: req.params.shopId,
        limit: parseInt(req.query.limit) || 50,
        page: parseInt(req.query.page) || 1,
        sort: req.query.sort || "ctime",
      }),
    }).send(res);
  };
}

module.exports = new RatingController();
