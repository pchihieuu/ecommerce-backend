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

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(`Create Token Error::`, error);
    throw error;
  }
};

const authenticationV2 = asyncHandler(async (req, res, next) => {
  // Get user ID from header
  const userId = req.headers[HEADERS.CLIENT_ID];
  if (!userId)
    throw new AuthFailureResponse("Invalid request - missing client ID");

  // Find key store for this user
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundResponse("Key store not found");

  // Check for refresh token (prioritize this for refresh token endpoint)
  if (req.headers[HEADERS.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADERS.REFRESH_TOKEN];

      // Verify the refresh token
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureResponse("Invalid user ID");
      }

      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      console.error("Refresh token verification error:", error.message);
      throw new AuthFailureResponse("Invalid refresh token");
    }
  }

  // Check for access token
  if (req.headers[HEADERS.AUTHORIZATION]) {
    try {
      const accessToken = req.headers[HEADERS.AUTHORIZATION];

      const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureResponse("Invalid user ID");
      }

      req.keyStore = keyStore;
      req.user = decodeUser;
      return next();
    } catch (error) {
      console.error("Access token verification error:", error.message);
      throw new AuthFailureResponse("Invalid access token");
    }
  }

  // No valid token provided
  throw new AuthFailureResponse("Access token or refresh token required");
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authenticationV2,
  verifyJWT,
};
