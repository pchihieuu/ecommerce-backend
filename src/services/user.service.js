"use strict";

const otpModel = require("../models/otp.model");
const { BadRequestResponse } = require("../core/error.response");
const User = require("../models/user.model");

class UserService {
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
    const otp = await otpModel
      .findOne({ email, otp_token: token })
      .lean()
      .exec();
    if (!otp) {
      throw new BadRequestResponse("Invalid otp or email");
    }
    const user = await User.create({ email });
    /*
    then send another email to user to send temporary password
    request user to change password
    password is expired in 2 hours for example
    also create refresh and access token for user */

    return {
      message: "Verify email successfully",
    };
  }
}

module.exports = UserService;
