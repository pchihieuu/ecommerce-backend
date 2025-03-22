"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestResponse,
  AuthFailureResponse,
  ForbiddenResponse,
} = require("../core/error.response");
const { ValidationUtils } = require("../utils/validation");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITTER: "WRITTER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  // /* check token used*/
  static handleRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    // Debug information to find what's missing
    console.log("handleRefreshTokenV2 params:", {
      hasKeyStore: !!keyStore,
      hasUser: !!user,
      hasRefreshToken: !!refreshToken,
    });

    // Add validation to ensure all required parameters exist
    if (!keyStore || !user || !refreshToken) {
      console.error("Missing required parameters:", {
        keyStore: !!keyStore,
        user: !!user,
        refreshToken: !!refreshToken,
      });
      throw new BadRequestResponse("Invalid request parameters");
    }

    const { userId, email } = user;

    console.log("Debug - keyStore refreshToken:", keyStore.refreshToken);
    console.log("Debug - provided refreshToken:", refreshToken);
    console.log("Debug - refreshTokensUsed:", keyStore.refreshTokensUsed);

    // Ensure refreshTokensUsed is initialized
    if (!keyStore.refreshTokensUsed) {
      keyStore.refreshTokensUsed = [];
    }

    // Check if token has been used before
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyByUserId(userId);
      throw new ForbiddenResponse("Token has been used. Please login again");
    }

    // Check if provided token matches stored token
    if (keyStore.refreshToken !== refreshToken) {
      console.error("Token mismatch:", {
        storedToken: keyStore.refreshToken,
        providedToken: refreshToken,
      });
      throw new AuthFailureResponse("Invalid refresh token");
    }

    try {
      // check userId, email
      const foundShop = await findByEmail({ email });
      if (!foundShop) {
        throw new AuthFailureResponse("Shop not registered");
      }

      // Create new token pair
      const tokens = await createTokenPair(
        { userId, email },
        keyStore.publicKey,
        keyStore.privateKey
      );

      // Update keyStore with new refresh token and add old one to used list
      await keyStore.updateOne({
        $set: {
          refreshToken: tokens.refreshToken,
        },
        $addToSet: {
          refreshTokensUsed: refreshToken,
        },
      });

      console.log("Generated new tokens successfully:", {
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
      });

      return {
        user: { userId, email },
        tokens,
      };
    } catch (error) {
      console.error("Error in handleRefreshTokenV2:", error);
      throw error;
    }
  };

  // Other methods remain the same...
  static logOut = async (keyStore) => {
    if (!keyStore) {
      throw new BadRequestResponse("Invalid key store");
    }
    const delKey = await KeyTokenService.removeTokenById(keyStore._id);
    return delKey;
  };

  static signIn = async ({ email, password, refreshToken = null }) => {
    // 1. check email in database
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestResponse("Shop not registered!");

    // 2. match password
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureResponse("Authentication error");

    // 3. create private and public key
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4. generate tokens
    const tokens = await createTokenPair(
      {
        userId: foundShop._id,
        email,
      },
      publicKey,
      privateKey
    );

    // 5. Save token to database
    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      publicKey,
      privateKey,
      userId: foundShop._id,
      refreshTokensUsed: [], // Initialize empty array for used tokens
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    ValidationUtils.validateSignUpData({ email, password });
    // Check if shop already exists
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestResponse("Shop already registered");
    }

    // Create new shop with hashed password
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
        refreshTokensUsed: [], // Initialize empty array for used tokens
      });

      if (!keyStore) {
        throw new BadRequestResponse("Error creating keystore");
      }

      // create access tokens
      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
