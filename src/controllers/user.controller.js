"use strict";
const User = require("../models/user.model");
const { SuccessResponse } = require("../core/success.response");
const { BadRequestResponse } = require("../core/error.response");
const EmailService = require("../services/email.service");
const UserService = require("../services/user.service");

class UserController {
  async newUser(req, res, next) {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean().exec();
    if (user) {
      throw new BadRequestResponse("Email already registered");
    }
    new SuccessResponse({
      message: "User created successfully",
      metadata: await EmailService.sendEmail({ email }),
    }).send(res);
  }

  async checkRegisterEmailToken(req, res, next) {
    const { email, token } = req.body;

    if (!email || !token) {
      throw new BadRequestResponse("Invalid email or token");
    }

    new SuccessResponse({
      message: "Email verified successfully",
      metadata: await UserService.checkRegisterEmailToken({ email, token }),
    }).send(res);
  }
}

module.exports = new UserController();
