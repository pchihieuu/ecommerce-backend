"use strict";

const { SuccessRespone } = require("../core/success.respone");
const ProductService = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessRespone({
      message: "Create new product success",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // post
  publishProduct = async (req, res, next) => {
    new SuccessRespone({
      message: "Success",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unpublishProduct = async (req, res, next) => {
    new SuccessRespone({
      message: "unpublish product success",
      metadata: await ProductService.unpublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  /**
   * @description Get all draft for products
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  // start: query//
  getAllDraftProducts = async (req, res, next) => {
    new SuccessRespone({
      message: "Get list draft product success",
      metadata: await ProductService.findAllDraftProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  /**
   * @description Get all published products
   * @param {Number} limit
   * @param {Number} skip
   * @return {JSON}
   */
  getAllPublishedProducts = async (req, res, next) => {
    new SuccessRespone({
      message: "Get list published product success",
      metadata: await ProductService.findAllPublishedProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  searctProductsByUser = async (req, res, next) => {
    new SuccessRespone({
      message: "Get list search publish product success",
      metadata: await ProductService.searchProducts({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  // end: query //
}

module.exports = new ProductController();
