"use strict";
const User = require("../models/user.model");
const { SuccessResponse } = require("../core/success.response");
const { BadRequestResponse } = require("../core/error.response");
const UserService = require("../services/user.service");

class UserController {
  async newUser(req, res, next) {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean().exec();
    if (user) {
      throw new BadRequestResponse("Email already registered");
    }
    if (!email || !password) {
      throw new BadRequestResponse("Email and password are required");
    }

    new SuccessResponse({
      message: "Verification OTP sent",
      metadata: await UserService.newUser({ email, password }),
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
  async login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestResponse("Email and password are required");
    }

    new SuccessResponse({
      message: "Login successful",
      metadata: await UserService.login({ email, password }),
    }).send(res);
  }

  async logout(req, res, next) {
    new SuccessResponse({
      message: "Logout successful",
      metadata: await UserService.logout(req.keyStore),
    }).send(res);
  }
}

module.exports = new UserController();
