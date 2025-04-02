const { CACHE_PRODUCT } = require("../constants/cache.constant");
const { getCacheIO } = require("../models/repository/cache.repo");

const readCache = async (req, res, next) => {
  const { sku_id } = req.query;
  const skuKeyCache = `${CACHE_PRODUCT.SKU}${sku_id}`;

  // Get data from cache
  let skuCache = await getCacheIO({ key: skuKeyCache });

  if (!skuCache) return next();
  // If data there is the cache, parse and return it
  if (skuCache) {
    return res.status(200).json({
      ...JSON.parse(skuCache),
      toLoad: "cache",
    });
  }
};

module.exports = { readCache };
