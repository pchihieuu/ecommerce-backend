"use strict";

const AccessService = require("../services/access.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

class AccessController {
  refreshToken = async (req, res, next) => {
    // Debug information to see what's being passed
    console.log("refreshToken controller - req.user:", req.user);
    console.log("refreshToken controller - req.keyStore:", req.keyStore);
    console.log(
      "refreshToken controller - req.refreshToken:",
      req.refreshToken
    );

    // Make sure all required parameters are available
    if (!req.user || !req.keyStore || !req.refreshToken) {
      console.error("Missing required parameters for refresh token");
      console.error(
        `User: ${!!req.user}, KeyStore: ${!!req.keyStore}, RefreshToken: ${!!req.refreshToken}`
      );
    }

    new SuccessResponse({
      message: "RefreshToken successfully",
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  logOut = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout successful",
      metadata: await AccessService.logOut(req.keyStore),
    }).send(res);
  };

  signIn = async (req, res, next) => {
    new SuccessResponse({
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
