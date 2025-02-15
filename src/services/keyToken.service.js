"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // Convert public key to string if needed
      // const publicKeyString = publicKey.toString();

      // Create token document
      //   const filter = { user: userId };
      //   const update = {
      //     publicKey: publicKeyString,
      //     refreshTokens: refreshToken ? [refreshToken] : [],
      //     user: userId,
      //   };
      //   const options = { upsert: true, new: true };

      const filter = { user: userId}, update = {
        publicKey, privateKey, refreshTokensUsed: [], refreshToken
      }, options = { upsert: true, new: true }
      const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error("Create Key Token Error::", error);
      return null;
    }
  };
}

module.exports = KeyTokenService;
