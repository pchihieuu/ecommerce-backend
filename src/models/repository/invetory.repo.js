const { inventory } = require("../inventory.model");

const insertInventory = async ({
  product_id,
  location = "Unknown",
  stock,
  shop_id,
}) => {
  return await inventory.create({
    inventory_product_id: product_id,
    inventory_location: location,
    inventory_stock: stock,
    inventory_shop_id: shop_id,
  });
};

module.exports = {
  insertInventory,
};
