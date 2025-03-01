const redisPubSubService = require("../services/redisPubSub.service");

class ProductServiceTest {
  purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    };
    console.log("productId", productId);
    redisPubSubService.publish("purchase_events", JSON.stringify(order));
    console.log("Publishing purchase event for:", order);
  }
}

module.exports = new ProductServiceTest();
