"use strict";

const Rating = require("../rating.model");
const { product } = require("../product.model");
const { BadRequestResponse } = require("../../core/error.response");

const createRating = async ({
  rating_userId,
  rating_productId,
  rating_shopId,
  rating_content,
  rating_value,
  rating_images = [],
}) => {
  try {
    const foundRating = await Rating.findOne({
      rating_userId,
      rating_productId,
      isDeleted: false,
    });

    if (foundRating) {
      throw new BadRequestResponse("You have already rated this product");
    }

    const newRating = await Rating.create({
      rating_userId,
      rating_productId,
      rating_shopId,
      rating_content,
      rating_value,
      rating_images,
    });

    if (newRating) {
      // Update product rating average
      await updateProductRatingAverage(rating_productId);
    }

    return newRating;
  } catch (error) {
    throw new BadRequestResponse(error.message);
  }
};

const updateRating = async ({
  rating_id,
  rating_userId,
  rating_content,
  rating_value,
  rating_images,
}) => {
  try {
    const foundRating = await Rating.findOne({
      _id: rating_id,
      rating_userId,
      isDeleted: false,
    });

    if (!foundRating) {
      throw new BadRequestResponse(
        "Rating not found or you are not authorized",
      );
    }

    const updateData = {};
    if (rating_content !== undefined) {
      updateData.rating_content = rating_content;
    }

    if (rating_value !== undefined) {
      updateData.rating_value = rating_value;
    }

    if (rating_images !== undefined) {
      updateData.rating_images = rating_images;
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      rating_id,
      updateData,
      { new: true },
    );

    if (updatedRating) {
      await updateProductRatingAverage(updatedRating.rating_productId);
    }

    return updatedRating;
  } catch (error) {
    throw new BadRequestResponse(error.message);
  }
};

const deleteRating = async ({ rating_id, rating_userId }) => {
  try {
    const foundRating = await Rating.findOne({
      _id: rating_id,
      rating_userId,
      isDeleted: false,
    });

    if (!foundRating) {
      throw new BadRequestResponse(
        "Rating not found or you are not authorized",
      );
    }

    const productId = foundRating.rating_productId;

    const deletedRating = await Rating.findByIdAndUpdate(
      rating_id,
      {
        isDeleted: true,
      },
      { new: true },
    );

    if (deletedRating) {
      // Update product rating average
      await updateProductRatingAverage(productId);
    }

    return deletedRating;
  } catch (error) {
    throw new BadRequestResponse(error.message);
  }
};

const getRatingsByProduct = async ({
  productId,
  limit = 50,
  skip = 0,
  sort = "ctime",
}) => {
  const sortOptions = sort === "ctime" ? { createdAt: -1 } : { updatedAt: -1 };

  const ratings = await Rating.find({
    rating_productId: productId,
    isDeleted: false,
  })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate("rating_userId", "name email")
    .lean();

  return ratings;
};

const getRatingsByShop = async ({
  shopId,
  limit = 50,
  skip = 0,
  sort = "ctime",
}) => {
  const sortOptions = sort === "ctime" ? { createdAt: -1 } : { updatedAt: -1 };

  const ratings = await Rating.find({
    rating_shopId: shopId,
    isDeleted: false,
  })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate("rating_userId", "name email")
    .populate("rating_productId", "product_name product_thumb")
    .lean();

  return ratings;
};

const getRatingStatistics = async (productId) => {
  const stats = await Rating.aggregate([
    {
      $match: {
        rating_productId: productId,
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$rating_value",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  const ratingCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let totalRatings = 0;

  stats.forEach((item) => {
    ratingCounts[item._id] = item.count;
    totalRatings += item.count;
  });

  // Calculate percentage for each rating
  const ratingStats = [];
  for (let i = 5; i >= 1; i--) {
    const percentage =
      totalRatings > 0 ? (ratingCounts[i] / totalRatings) * 100 : 0;
    ratingStats.push({
      value: i,
      count: ratingCounts[i],
      percentage: Math.round(percentage * 10) / 10,
    });
  }

  return {
    totalRatings,
    ratingStats,
  };
};

// Update product rating average
const updateProductRatingAverage = async (productId) => {
  try {
    const result = await Rating.aggregate([
      {
        $match: {
          rating_productId: productId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating_value" },
          numberOfRatings: { $sum: 1 },
        },
      },
    ]);

    let ratingAverage = 0;
    if (result.length > 0) {
      ratingAverage = result[0].averageRating;
    }

    // Update the product with new average rating
    await product.findByIdAndUpdate(productId, {
      product_ratingsAverage: ratingAverage,
    });

    return ratingAverage;
  } catch (error) {
    throw new BadRequestResponse("Failed to update product rating average");
  }
};

module.exports = {
  createRating,
  updateRating,
  deleteRating,
  getRatingsByProduct,
  getRatingsByShop,
  getRatingStatistics,
  updateProductRatingAverage,
};
