"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
// ['a', 'b'] => {a: 1, b: 1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unSelectData = (unselect = []) => {
  return Object.fromEntries(unselect.map((el) => [el, 0]));
};

const removeUndefinedObject = (object) => {
  const newObj = {};
  Object.keys(object).forEach((key) => {
    if (object[key] !== undefined || object[key !== null]) {
      newObj[key] = object[key];
    }
  });
  return newObj;
};

const randomSpuId = () => {
  return Math.floor(100000 * Math.random() * 900000);
};

const updateNestedObject = (object) => {
  if (object === null || typeof object !== "object") {
    return object;
  }

  const final = {};
  Object.keys(object).forEach((key) => {
    if (
      typeof object[key] === "object" &&
      !Array.isArray(object[key]) &&
      object[key] !== null
    ) {
      const nested = updateNestedObject(removeUndefinedObject(object[key]));
      if (typeof nested === "object" && Object.keys(nested).length > 0) {
        Object.keys(nested).forEach((nestedKey) => {
          final[`${key}.${nestedKey}`] = nested[nestedKey];
        });
      }
    } else {
      final[key] = object[key];
    }
  });
  return final;
};

const convertToObjectId = (id) => {
  return new Types.ObjectId(id);
};

module.exports = {
  getInfoData,
  getSelectData,
  unSelectData,
  removeUndefinedObject,
  updateNestedObject,
  convertToObjectId,
  randomSpuId,
};
