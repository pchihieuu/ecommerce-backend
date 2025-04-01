"use strict";
const SPUService = require("../services/spu.service");
const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const SKUService = require("../services/sku.service");
const { BadRequestResponse } = require("../core/error.response");

class ProductController {
  getDetailSku = async (req, res, next) => {
    try {
      const { sku_id, spu_id } = req.query;
      new SuccessResponse({
        message: "Get detail sku success",
        metadata: await SKUService.getDetailSku({ sku_id, spu_id }),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  getListSkuBySpuId = async (req, res, next) => {
    const { spu_id } = req.query;
    if (!spu_id) {
      throw new BadRequestResponse("Missing query params");
    }
    new SuccessResponse({
      message: "Get list sku by spu_id successfully",
      metadata: await SKUService.getListSkuBySpuId({ spu_id }),
    }).send(res);
  };

  getDetailSpu = async (req, res, next) => {
    try {
      const { spu_id } = req.query;
      if (!spu_id) {
        throw new BadRequestResponse("Missing query params");
      }
      new SuccessResponse({
        message: "Get spu detail successfully",
        metadata: await SPUService.getDetailSpu({ spu_id }),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  createNewSpu = async (req, res, next) => {
    try {
      new SuccessResponse({
        message: "Create a new spu successfully",
        metadata: await SPUService.createNewSpu({
          ...req.body,
          spu_shop: req.user.userId,
        }),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req, res, next) => {
    const productData = JSON.parse(req.body.data);

    new SuccessResponse({
      message: "Create new product success",
      metadata: await ProductService.createProduct(
        productData.product_type,
        {
          ...productData,
          product_shop: req.user.userId,
        },
        req.file
      ),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Product updated",
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.product_id,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };

  // post
  publishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unpublishProduct = async (req, res, next) => {
    new SuccessResponse({
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
    new SuccessResponse({
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
    new SuccessResponse({
      message: "Get list published product success",
      metadata: await ProductService.findAllPublishedProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  searchProductsByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search publish product success",
      metadata: await ProductService.searchProducts({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list all product success",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  getDetailProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get detail product success",
      metadata: await ProductService.findDetailProduct({
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // end: query //
}

module.exports = new ProductController();
