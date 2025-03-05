"use strict";

const JWT = require("jsonwebtoken");
const HEADERS = require("../constants/headers.constant");
const { asyncHandler } = require("../helpers/asyncHandler");
const {
  AuthFailureResponse,
  NotFoundResponse,
} = require("../core/error.response");
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
  /**
   * 1 - Check userId missing ?
   * 2 - Get access token
   * 3 - Verify token
   * 4 - Check user in db
   * 5 - Check keyStore with this userId
   */
  const userId = req.headers[HEADERS.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureResponse("Invalid Request");
  }
  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundResponse("Not Found");
  }
  const accessToken = req.headers[HEADERS.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureResponse("Invalid Request");
  }
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new NotFoundResponse("Not Found");
    }
    req.keyStore = keyStore;
    req.userId = decodeUser;
    return next();
  } catch (error) {
    throw new Error(error.message);
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADERS.CLIENT_ID];
  if (!userId) throw new AuthFailureResponse("Invalid request");

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundResponse("KeyStore not found");

  // Kiểm tra access token trước
  if (req.headers[HEADERS.AUTHORIZATION]) {
    try {
      const accessToken = req.headers[HEADERS.AUTHORIZATION];
      const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
      if (userId !== decodeUser.userId)
        throw new AuthFailureResponse("Invalid userid");
      req.keyStore = keyStore;
      req.user = decodeUser;
      return next();
    } catch (error) {
      throw new AuthFailureResponse("Invalid access token");
    }
  }

  // Nếu không có access token, kiểm tra refresh token
  if (req.headers[HEADERS.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADERS.REFRESH_TOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId)
        throw new AuthFailureResponse("Invalid userid");
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw new AuthFailureResponse("Invalid refresh token");
    }
  }

  // Nếu không có token nào
  throw new AuthFailureResponse("Access token or refresh token required");
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT,
};
