"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
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

      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokensUsed: [],
          refreshToken,
        },
        options = { upsert: true, new: true };
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error("Create Key Token Error::", error);
      return error;
    }
  };
  static findByUserId = async (userId) => {
    return await keytokenModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();
  };
  static removeTokenById = async (id) => {
    return await keytokenModel.deleteOne({ _id: id });
  };
  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({
        refreshTokensUsed: refreshToken,
      })
      .lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({
      refreshToken: refreshToken,
    });
  };

  static deleteKeyByUserId = async (userId) => {
    return await keytokenModel.findOneAndDelete({
      user: new Types.ObjectId(userId),
    });
  };
}

module.exports = KeyTokenService;
