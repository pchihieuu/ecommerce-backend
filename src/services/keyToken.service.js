"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
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

      const tokens = await keytokenModel.create({
        user: userId,
        publicKey,
        privateKey
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error("Create Key Token Error::", error);
      return null;
    }
  };
}

module.exports = KeyTokenService;
