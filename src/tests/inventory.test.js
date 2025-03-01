const redisPubSubService = require("../services/redisPubSub.service");

class InventoryServiceTest {
  constructor() {
    redisPubSubService.subscribe(
      "purchase_events",
      function (channel, message) {
        console.log("Recevied message:", message);

        InventoryServiceTest.updateInventory(JSON.parse(message));
      }
    );
  }

  static updateInventory({ productId, quantity }) {
    console.log(
      `Updating inventory for product ${productId} with quantity ${quantity}`
    );
  }
}

module.exports = new InventoryServiceTest();
