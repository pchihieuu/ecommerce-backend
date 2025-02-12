"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
  SHOP: "SHOP",
  WRITTER: "WRITTER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // Check if shop already exists
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: 400,
          message: "Shop already registered!",
        };
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
        // Create private, public key pair
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        // });

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");
        console.log({ publicKey, privateKey });

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });

        if (!keyStore) {
          throw new Error("keyStore is error");
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

        // Create access tokens BEFORE saving to key store
        // const tokens = await createTokenPair(
        //   { userId: newShop._id, email },
        //   publicKey,
        //   privateKey
        // );

        // if (!tokens) {
        //   throw new Error("Create token pair failed");
        // }

        // Save public key and refresh token to key store
        // const keyStore = await KeyTokenService.createKeyToken({
        //   userId: newShop._id,
        //   publicKey,
        //   refreshToken: tokens.refreshToken,
        // });

        // if (!keyStore) {
        //   throw new Error("Create key store failed");
        // }

        // Return both shop info and tokens
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
    } catch (error) {
      console.error("SignUp Error::", error);
      return {
        code: 500,
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
