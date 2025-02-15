"use strict";

const AccessService = require("../services/access.service");
const { CREATED, SuccessRespone } = require("../core/success.respone");
class AccessController {
  refreshToken = async (req, res, next) => {
    new SuccessRespone({
      message: "RefreshToken successfully",
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };
  logOut = async (req, res, next) => {
    new SuccessRespone({
      message: "Logout successfull",
      metadata: await AccessService.logOut(req.keyStore),
    }).send(res);
  };
  signIn = async (req, res, next) => {
    new SuccessRespone({
      metadata: await AccessService.signIn(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Register successfully!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new AccessController();
