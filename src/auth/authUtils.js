"use strict";

const JWT = require("jsonwebtoken");
const HEADERS = require("../constants/headers.constant");
const { asyncHandler } = require("../helpers/asyncHandler");
const {
  AuthFailureRespone,
  NotFoundRespone,
} = require("../core/error.respone");
const { findByUserId } = require("../services/keyToken.service");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // Create access token
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    // Create refresh token
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    // Verify access token (optionals)
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    console.log(`Created Tokens::`, { accessToken, refreshToken });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(`Create Token Error::`, error);
    throw error;
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  // 1. check userId missing?
  // 2. get accessToken
  // 3. verify token
  // 4. check user in dbs
  // 5. check keyStore with userId
  // 6. return next
  const userId = req.headers[HEADERS.CLIENT_ID];
  if (!userId) throw new AuthFailureRespone("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundRespone("KeyStore not found");

  const accessToken = req.headers[HEADERS.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureRespone("Invalid request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureRespone("Invalid user");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
