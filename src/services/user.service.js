"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  BadRequestResponse,
  NotFoundResponse,
} = require("../core/error.response");
const User = require("../models/user.model");
const OtpService = require("./otp.service");
const Role = require("../models/role.model");
const createUser = require("../models/repository/user.repo");
const { createTokenPair } = require("../auth/authUtils");
const KeyTokenService = require("./keyToken.service");
const { getInfoData } = require("../utils");

class UserService {
  static async findUserByEmail({ email = null }) {
    return await User.findOne({ user_email: email }).lean().exec();
  }

  static async newUser({ email = null, password = null }) {
    if (!email || !password) {
      throw new BadRequestResponse("Email and password are required");
    }

    const existingUser = await UserService.findUserByEmail({ email });
    if (existingUser) {
      throw new BadRequestResponse("Email already exists");
    }

    const role = await Role.findOne({ role_name: "user" });
    if (!role) {
      throw new NotFoundResponse("Role not found");
    }

    // const otp = await OtpService.newOtp({ email, password });
    const EmailService = require("./email.service");
    const otp = await EmailService.sendEmail({ email, password });

    return {
      message: "Verification OTP sent to email",
      otpId: otp._id,
    };
  }

  static async checkRegisterEmailToken({ email = null, token = null }) {
    // Check if OTP is valid
    const otp = await OtpService.checkOtp({ email, token });

    const existingUser = await UserService.findUserByEmail({ email });

    if (existingUser) {
      throw new BadRequestResponse("Email already exists");
    }

    const role = await Role.findOne({ role_name: "user" });
    if (!role) {
      throw new NotFoundResponse("Role not found");
    }

    const user_slug = email.split("@")[0].toLowerCase();
    const newUser = await createUser({
      user_id: Date.now(),
      user_name: email.split("@")[0],
      user_slug: user_slug,
      user_email: email,
      user_password: otp.user_password,
      user_role: role._id,
      user_status: "active",
    });

    if (newUser) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");
      const tokens = await createTokenPair(
        {
          userId: newUser._id,
          email,
        },
        publicKey,
        privateKey
      );

      // Store tokens
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken,
      });

      if (!keyStore) {
        throw new BadRequestResponse("Error: Public key string error");
      }

      return {
        user: getInfoData({
          fields: ["_id", "user_name", "user_email", "user_status"],
          object: newUser,
        }),
        tokens,
      };
    }

    return {
      message: "Verify email successfully",
    };
  }

  static async login({ email = null, password = null }) {
    const user = await User.findOne({ user_email: email });
    if (!user) {
      throw new NotFoundResponse("User not found");
    }

    if (user.user_status !== "active") {
      throw new BadRequestResponse("User account is not active");
    }

    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) {
      throw new BadRequestResponse("Invalid credentials");
    }

    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const tokens = await createTokenPair(
      {
        userId: user._id,
        email,
      },
      publicKey,
      privateKey
    );

    const keyStore = await KeyTokenService.createKeyToken({
      userId: user._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    if (!keyStore) {
      throw new BadRequestResponse("Error: Public key string error");
    }

    return {
      user: getInfoData({
        fields: ["_id", "user_name", "user_email", "user_status"],
        object: user,
      }),
      tokens,
    };
  }

  static async logout(keyStore) {
    if (!keyStore) {
      throw new BadRequestResponse("Invalid key store");
    }
    const delKey = await KeyTokenService.removeTokenById(keyStore._id);
    return delKey;
  }
}

module.exports = UserService;
