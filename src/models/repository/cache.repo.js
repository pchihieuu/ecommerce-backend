"use strict";

const { getIORedis } = require("../../db/init.redis");

/**
 * Get current Redis connection
 * @returns {Promise<any>} Redis client instance
 */
const getRedisInstance = async () => {
  // If there is already a connection, return
  if (getIORedis.instanceConnect) {
    return getIORedis.instanceConnect;
  }

  // Initialize redis connection if not already present
  const { getInstance } = require("../../db/init.redis");
  return getInstance();
};

/**
 * Set cache to have no expiration time
 */
const setCache = async ({ key, value }) => {
  try {
    const redisClient = await getRedisInstance();
    return await redisClient.set(key, value);
  } catch (error) {
    console.error("Error setting cache:", error);
    throw new Error(`Failed to set cache: ${error.message}`);
  }
};

/**
 * Set cache with expiration time in seconds
 */
const setCacheIOExpiration = async ({ key, value, expirationSeconds }) => {
  try {
    const redisClient = await getRedisInstance();
    return await redisClient.set(key, value, "EX", expirationSeconds);
  } catch (error) {
    console.error("Error setting cache with expiration:", error);
    throw new Error(`Failed to set cache with expiration: ${error.message}`);
  }
};

/**
 * Get data from cache by key
 */
const getCacheIO = async ({ key }) => {
  try {
    const redisClient = await getRedisInstance();
    return await redisClient.get(key);
  } catch (error) {
    console.error("Error getting cache:", error);
    throw new Error(`Failed to get cache: ${error.message}`);
  }
};

module.exports = {
  setCache,
  setCacheIOExpiration,
  getCacheIO,
};
