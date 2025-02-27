"use strict";

const InventoryService = require("../services/inventory.service");
const { SuccessRespone } = require("../core/success.respone");

class InventoryController {
  async addStockToInventory(req, res, next) {
    new SuccessRespone({
      message: "Create new cart add stock to inventory",
      metadata: await InventoryService.addStockToInventory(req.body),
    }).send(res);
  }
}

module.exports = new InventoryController();
