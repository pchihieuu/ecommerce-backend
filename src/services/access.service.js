"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestRespone,
  AuthFailureRespone,
} = require("../core/error.respone");
const { ValidationUtils } = require("../utils/validation");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITTER: "WRITTER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signIn = async ({ email, password, refreshToken = null }) => {
    // 1. check email dbs
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestRespone("Shop not registered!");

    // 2. match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureRespone("Authentication error");

    // 3. create private and public key
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4. generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      {
        userId: foundShop._id,
        email,
      },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      publicKey,
      privateKey,
      userId: foundShop._id,
    });

    return {
      shop: getInfoData({
        fileds: ["_id", "name", "email"],
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
      throw new BadRequestRespone("Shop already registered ");
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
      console.log({ publicKey, privateKey });

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestRespone("Keystore tis error");
        // throw new Error("keyStore is error");
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
      console.log(`Create tokens success: `, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fileds: ["id", "name", "email"],
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
