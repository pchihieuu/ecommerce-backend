"use strict";

const {
  createRating,
  updateRating,
  deleteRating,
  getRatingsByProduct,
  getRatingsByShop,
  getRatingStatistics,
} = require("../models/repository/rating.repo");
const { findDetailProduct } = require("../models/repository/product.repo");
const { BadRequestResponse } = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
const ratingModel = require("../models/rating.model");

class RatingService {
  static async uploadRatingImages(files) {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const base64Image = file.buffer.toString("base64");

        cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64Image}`,
          {
            folder: "ratings",
          },
          (error, result) => {
            if (error) {
              return reject(
                new Error(`Cloudinary upload error: ${error.message}`),
              );
            }
            resolve(result.secure_url);
          },
        );
      });
    });

    return await Promise.all(uploadPromises);
  }

  static async createProductRating({
    userId,
    productId,
    content,
    ratingValue,
    files = [],
  }) {
    // Check if product exists
    const foundProduct = await findDetailProduct({ product_id: productId });
    if (!foundProduct) {
      throw new BadRequestResponse("Product not found");
    }

    let ratingImages = [];
    if (files && files.length > 0) {
      ratingImages = await this.uploadRatingImages(files);
    }

    // Create rating
    return await createRating({
      rating_userId: userId,
      rating_productId: productId,
      rating_shopId: foundProduct.product_shop,
      rating_content: content,
      rating_value: ratingValue,
      rating_images: ratingImages,
    });
  }

  static async updateProductRating({
    userId,
    ratingId,
    content,
    ratingValue,
    files = [],
    clearImages = false,
  }) {
    const currentRating = await ratingModel.findOne({
      _id: ratingId,
      rating_userId: userId,
      isDeleted: false,
    });

    if (!currentRating) {
      throw new BadRequestResponse(
        "Rating not found or you are not authorized",
      );
    }

    const updateData = {
      rating_id: ratingId,
      rating_userId: userId,
    };

    if (content !== undefined) {
      updateData.rating_content = content;
    }
    if (ratingValue !== undefined) {
      updateData.rating_value = ratingValue;
    }
    if (clearImages) {
      updateData.rating_images = [];
    }

    else if (files && files.length > 0) {
      const ratingImages = await this.uploadRatingImages(files);
      if (ratingImages.length > 0) {
        updateData.rating_images = ratingImages;
      }
    }

    return await updateRating(updateData);
  }

  static async deleteProductRating({ userId, ratingId }) {
    return await deleteRating({
      rating_id: ratingId,
      rating_userId: userId,
    });
  }

  static async getProductRatings({
    productId,
    limit = 50,
    page = 1,
    sort = "ctime",
  }) {
    const skip = (page - 1) * limit;
    const ratings = await getRatingsByProduct({
      productId,
      limit,
      skip,
      sort,
    });

    const statistics = await getRatingStatistics(productId);

    return {
      ratings,
      statistics,
      pagination: {
        page,
        limit,
        totalRatings: statistics.totalRatings,
      },
    };
  }

  static async getShopRatings({
    shopId,
    limit = 50,
    page = 1,
    sort = "ctime",
  }) {
    const skip = (page - 1) * limit;

    const ratings = await getRatingsByShop({
      shopId,
      limit,
      skip,
      sort,
    });

    return {
      ratings,
      pagination: {
        page,
        limit,
      },
    };
  }
}

module.exports = RatingService;
