"use strict";

const otpModel = require("../models/otp.model");
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
  static async newUser({ email = null, capcha = null }) {
    const user = await User.findOne({ email }).lean().exec();
    if (user) {
      throw new BadRequestResponse("Email already exists");
    }

    // check if captcha is valid => send to email
    return {
      message: "Send otp to email successfully",
    };
  }
  static async checkRegisterEmailToken({ email = null, token = null }) {
    // Check if OTP is valid
    const otp = await OtpService.checkOtp({ email, token });

    if (!otp) {
      throw new BadRequestResponse("Invalid otp or email");
    }
    // Check if user already exists
    const existingUser = await User.findOne({ user_email: email })
      .lean()
      .exec();
    if (existingUser) {
      throw new BadRequestResponse("Email already exists");
    }

    // Generate password hash
    const hashPassword = await bcrypt.hash(email, 10);

    // Find user role
    const role = await Role.findOne({ role_name: "user" });
    if (!role) {
      throw new NotFoundResponse("Role not found");
    }

    // Create new user
    const user_slug = email.split("@")[0].toLowerCase();
    const newUser = await createUser({
      user_id: Date.now(),
      user_name: email.split("@")[0],
      user_slug: user_slug,
      user_email: email,
      user_password: hashPassword,
      user_role: role._id,
    });

    if (newUser) {
      // Generate tokens
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
          fields: ["_id", "user_name", "user_email"],
          object: newUser,
        }),
        tokens,
      };
    }

    return {
      message: "Verify email successfully",
    };
  }
}

module.exports = UserService;
