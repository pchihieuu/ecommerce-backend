"use strict";
const { BadRequestRespone } = require("../core/error.respone");

const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const TYPES = {
  Electronics: "Electronics",
  Clothing: "Clothing",
  Furniture: "Furniture",
};
// Define Factory class to create product
class ProductFactory {
  static productRegistry = {}; //key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }
  static async createProduct(type, payload) {
    const productType = ProductFactory.productRegistry[type];
    if (!productType)
      throw new BadRequestRespone(`Invalid Product Type::${type}`);

    return new productType(payload).createProduct();
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
    return await product.create({ ...this, _id: product_id });
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
      throw new BadRequestRespone("Create new Clothing error");
    }
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestRespone("Create new Product error");
    }
    return newProduct;
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
      throw new BadRequestRespone("Create new Electronics error");
    }
    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) {
      throw new BadRequestRespone("Create new Product error");
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
      throw new BadRequestRespone("Create new Furniture error");
    }
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestRespone("Create new Product error");
    }
    return newProduct;
  }
}
// export register product types
ProductFactory.registerProductType(TYPES.Electronics, Electronics);
ProductFactory.registerProductType(TYPES.Clothing, Clothing);
ProductFactory.registerProductType(TYPES.Furniture, Furniture);

module.exports = ProductFactory;
