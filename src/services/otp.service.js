"use strict";

const otpModel = require("../models/otp.model");
const crypto = require("crypto");
class OtpService {
  static async generateToken() {
    return crypto.randomInt(0, Math.pow(2, 32));
  }
  static async newOtp({ email = null }) {
    // generate token
    const token = await OtpService.generateToken();
    // new otp
    const newOtp = await otpModel.create({
      otp_email: email,
      otp_token: token,
    });
    return newOtp;
  }
}

module.exports = OtpService;
