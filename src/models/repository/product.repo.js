"use strict";

const { product } = require("../product.model");
const { Types, default: mongoose } = require("mongoose");
const {
  getSelectData,
  unSelectData,
  convertToObjectId,
} = require("../../utils/index");

const findAllDraftProducts = async ({ query, limit, skip }) => {
  return await queryListProducts({ query, limit, skip });
};
const findAllPublishedProducts = async ({ query, limit, skip }) => {
  return await queryListProducts({ query, limit, skip });
};

const searchProductsByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        $text: { $search: regexSearch },
        isPublished: true,
      },
      {
        score: { $meta: "textScore" },
      },
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

const findAllProducts = async ({
  limit = 50,
  sort,
  page = 1,
  filter,
  select,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findDetailProduct = async ({ product_id, unSelect }) => {
  return await product
    .findById(product_id)
    .select(unSelectData(unSelect))
    .lean();
};

const updateProductById = async ({
  product_id,
  updateData,
  model,
  isNews = true,
}) => {
  return await model.updateOne(
    {
      _id: new mongoose.Types.ObjectId(product_id),
    },
    updateData,
    { new: isNews },
  );
};

const getProductById = async ({ productId }) => {
  return await product
    .findOne({
      _id: convertToObjectId(productId),
      isPublished: true,
    })
    .lean();
};

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById({
        productId: product.productId,
      });
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity, // Use the requested quantity, not product_quantity
          productId: product.productId,
          // name: foundProduct.product_name,
          // shop_id: foundProduct.product_shop,
        };
      }
    }),
  );
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

const updateProductRating = async (productId, newRatingAvg) => {
  return await product.findByIdAndUpdate(
    convertToObjectId(productId),
    {
      product_ratingsAverage: newRatingAvg,
    },
    { new: true },
  );
};

module.exports = {
  findAllDraftProducts,
  publishProductByShop,
  findAllPublishedProducts,
  unpublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findDetailProduct,
  updateProductById,
  getProductById,
  checkProductByServer,
  updateProductRating,
};
