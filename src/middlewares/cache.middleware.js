const { CACHE_PRODUCT } = require("../constants/cache.constant");
const { getCacheIO } = require("../models/repository/cache.repo");

const validateSkuParams = async (req, res, next) => {
  const { sku_id } = req.query;

  if (!sku_id) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Missing query params",
    });
  }

  if (isNaN(sku_id) || sku_id < 0) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Invalids sku_id format",
    });
  }

  next();
};

const validateSpuParams = async (req, res, next) => {
  const { spu_id } = req.query;

  if (!spu_id) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Missing query params",
    });
  }

  if (isNaN(spu_id) || spu_id < 0) {
    return res.status(400).json({
      code: "Bad Request",
      message: "Invalids spu_id format",
    });
  }

  next();
};

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

const readCacheSkuList = async (req, res, next) => {
  const { spu_id } = req.query;

  if (!spu_id) return next();

  const skuListKeyCache = `${CACHE_PRODUCT.SKU_LIST}${spu_id}`;

  let skuListCache = await getCacheIO({ key: skuListKeyCache });
  if (!skuListCache) return next();

  if (skuListCache) {
    return res.status(200).json({
      ...JSON.parse(skuListCache),
      toLoad: "cache",
    });
  }
};

module.exports = {
  readCache,
  validateSkuParams,
  readCacheSkuList,
  validateSpuParams,
};
