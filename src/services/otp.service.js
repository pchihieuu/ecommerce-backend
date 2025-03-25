"use strict";

const { BadRequestResponse } = require("../core/error.response");
const otpModel = require("../models/otp.model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

class OtpService {
  static async generateToken() {
    return crypto.randomInt(0, Math.pow(2, 32));
  }

  static async newOtp({ email = null, password = null }) {
    // Validate inputs with more detailed logging
    if (!email) {
      console.error("Email is null or undefined");
      throw new BadRequestResponse("Email is required");
    }
    if (!password) {
      console.error("Password is null or undefined");
      throw new BadRequestResponse("Password is required");
    }
    const token = await OtpService.generateToken();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOtp = await otpModel.create({
      otp_email: email,
      otp_token: token,
      user_password: hashedPassword,
    });

    return newOtp;
  }
  static async checkOtp({ email = null, token = null }) {
    const otp = await otpModel
      .findOne({ otp_email: email, otp_token: token })
      .lean()
      .exec();

    if (!otp) {
      throw new BadRequestResponse("Invalid OTP token");
    }

    // delete because we only use one time
    await otpModel.deleteOne({ otp_email: email, otp_token: token });
    return otp;
  }
}

module.exports = OtpService;
