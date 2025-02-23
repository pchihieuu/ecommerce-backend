"use strict";

const { getSelectData, unSelectData } = require("../../utils");
const discountModel = require("../discount.model");

const findAllDiscountCodeUnselect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  unSelect = [],
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unSelectData(unSelect))
    .lean();

  return products;
};

const findAllDiscountCodeSelect = async ({
  limit = 50,
  page = 1,
  sort = "ctime",
  filter,
  select,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};
const updateDiscountByCode = async ({ code, body, isNew = true }) => {
  return await discountModel.findOneAndUpdate(
    { discount_code: code, discount_is_active: true },
    body,
    {
      new: isNew,
    }
  );
};

const checkDiscountExists = async ({ model, filter }) => {
  return await model.findOne(filter).lean();
};

module.exports = {
  findAllDiscountCodeUnselect,
  findAllDiscountCodeSelect,
  checkDiscountExists,
  updateDiscountByCode
};
