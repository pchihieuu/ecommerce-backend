"use strict";
const {
  findAllDraftProducts,
  publishProductByShop,
  findAllPublishedProducts,
  unpublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findDetailProduct,
  updateProductById,
} = require("../models/repository/product.repo");
const { BadRequestResponse } = require("../core/error.response");

const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { removeUndefinedObject, updateNestedObject } = require("../utils");
const { insertInventory } = require("../models/repository/inventory.repo");
const { pushNotiToSystem } = require("./notification.service");
const cloudinary = require("../configs/cloudinary.config");
const TYPES = {
  Electronics: "Electronics",
  Clothing: "Clothing",
  Furniture: "Furniture",
};
// Define Factory class to create product
class ProductFactory {
  static productRegistry = {}; //key-class

  static async uploadProductThumb(file) {
    return new Promise((resolve, reject) => {
      const base64Image = file.buffer.toString("base64");

      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${base64Image}`,
        {
          folder: "products",
        },
        (error, result) => {
          if (error) {
            return reject(
              new Error(`Cloudinary upload error: ${error.message}`)
            );
          }
          resolve(result);
        }
      );
    });
  }

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload, productThumb) {
    const productType = ProductFactory.productRegistry[type];
    if (!productType)
      throw new BadRequestResponse(`Invalid Product Type::${type}`);

    // If productThumb is provided, upload to Cloudinary
    let thumbUrl = null;
    if (productThumb) {
      try {
        const uploadResult = await this.uploadProductThumb(productThumb);
        thumbUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestResponse(`Image upload failed: ${error.message}`);
      }
    }

    // Add the thumb URL to the payload if available
    if (thumbUrl) {
      payload.product_thumb = thumbUrl;
    }

    return new productType(payload).createProduct();
  }
  // put
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unpublishProductByShop({ product_shop, product_id }) {
    return await unpublishProductByShop({ product_shop, product_id });
  }

  // query
  static async findAllDraftProducts({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftProducts({ query, limit, skip });
  }
  static async findAllPublishedProducts({
    product_shop,
    limit = 50,
    skip = 0,
  }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedProducts({ query, limit, skip });
  }
  static async searchProducts({ keySearch }) {
    return await searchProductsByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: [
        "product_name",
        "product_thumb",
        "product_price",
        "product_shop",
      ],
    });
  }

  static async findDetailProduct({ product_id }) {
    return await findDetailProduct({ product_id, unSelect: ["__v"] });
  }

  static async updateProduct(product_type, product_id, payload) {
    const productType = ProductFactory.productRegistry[product_type];
    if (!productType)
      throw new BadRequestResponse(`Invalid Product Type::${product_type}`);

    return new productType(payload).updateProduct(product_id);
  }
}
// Define base Product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      // add product_stock in inventory collection
      await insertInventory({
        product_id: newProduct._id,
        shop_id: newProduct.product_shop,
        stock: newProduct.product_quantity,
        location: "Tp.Ho Chi Minh. Vietnam",
      });
      // noti new product is created here
      // push noti to noti system
      pushNotiToSystem({
        type: "SHOP-001",
        senderId: this.product_shop,
        receivedId: 1,
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop,
        },
      })
        .then((res) => console.log(res))
        .catch(console.error);
    }
    return newProduct;
  }

  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({
      product_id: productId,
      updateData: bodyUpdate,
      model: product,
    });
  }
}
// Define Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestResponse("Create new Clothing error");
    }
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestResponse("Create new Product error");
    }
    return newProduct;
  }

  async updateProduct(product_id) {
    const objectParams = removeUndefinedObject(this);
    if (objectParams.product_attributes) {
      await updateProductById({
        product_id: product_id,
        updateData: updateNestedObject(objectParams.product_attributes),
        model: clothing,
      });
    }
    const updateProduct = await super.updateProduct(
      product_id,
      updateNestedObject(objectParams)
    );
    return updateProduct;
  }
}
// Define Electronic
class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) {
      throw new BadRequestResponse("Create new Electronics error");
    }
    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) {
      throw new BadRequestResponse("Create new Product error");
    }
    return newProduct;
  }
}
// Define Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) {
      throw new BadRequestResponse("Create new Furniture error");
    }
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestResponse("Create new Product error");
    }
    return newProduct;
  }
}
// export register product types
ProductFactory.registerProductType(TYPES.Electronics, Electronics);
ProductFactory.registerProductType(TYPES.Clothing, Clothing);
ProductFactory.registerProductType(TYPES.Furniture, Furniture);

module.exports = ProductFactory;
