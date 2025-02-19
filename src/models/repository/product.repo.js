"use strict";

const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../product.model");
const { Types } = require("mongoose");

const findAllDraftProducts = async ({ query, limit, skip }) => {
  return await queryListProducts({ query, limit, skip });
};
const findAllPublishedProducts = async ({ query, limit, skip }) => {
  return await queryListProducts({ query, limit, skip });
};

const searctProductsByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        $text: { $search: regexSearch },
        isPublished: true,
      },
      {
        score: { $meta: "textScore" },
      }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return results;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublished = true;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const unpublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublished = false;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};
const queryListProducts = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};
module.exports = {
  findAllDraftProducts,
  publishProductByShop,
  findAllPublishedProducts,
  unpublishProductByShop,
  searctProductsByUser,
};
