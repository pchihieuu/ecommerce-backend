"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestRespone,
  AuthFailureRespone,
  ForbiddenRespone,
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
  // /* check token used*/
  static handleRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyByUserId(userId);
      throw new ForbiddenRespone("Something wrong happened!! Please relogin");
    }
    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureRespone("Shop not registered");
    }
    // check userId, email
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureRespone("Shop not registerred");
    }
    // neu thoa man hop le
    // 1. create cap token moi
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );
    // 2. dua refreshToken vua gui vao danh sach het han
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // Match the model field name
      },
    });
    return {
      user,
      tokens,
    };
  };

  static handleRefreshToken = async (refreshToken) => {
    // xem refreshToken gui len da het han hay chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );

    if (foundToken) {
      // decode ra xem may la thang nao?
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );

      if (userId && email) {
        await KeyTokenService.deleteKeyByUserId(userId);
        throw new ForbiddenRespone("Something wrong happened!! Please relogin");
      }
    }

    // neu refreshToken chua het han, kiem tra xem refreshToken co phai do he thong tao hay khong
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureRespone("Shop not registerred");
    }

    // verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    // check userId, email
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureRespone("Shop not registerred");
    }

    // neu thoa man hop le
    // 1. create cap token moi
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await createTokenPair(
        {
          userId,
          email,
        },
        holderToken.privateKey,
        holderToken.publicKey
      );
    // 2. dua refreshToken vua gui vao danh sach het han
    await holderToken.updateOne({
      $set: {
        refreshToken: newRefreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });
    return {
      user: { userId, email },
      tokens: {
        refreshToken: newRefreshToken,
        accessToken: newAccessToken,
      },
    };
  };

  static logOut = async (keyStore) => {
    const delKey = await KeyTokenService.removeTokenById(keyStore._id);
    return delKey;
  };

  static signIn = async ({ email, password, refreshToken = null }) => {
    // 1. check email dbs
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestRespone("Shop not registered!");

    // 2. match password
    const match = await bcrypt.compare(password, foundShop.password);
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
