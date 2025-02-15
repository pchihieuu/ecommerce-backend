"use strict";

const AccessService = require("../services/access.service");
const { CREATED, SuccessRespone } = require("../core/success.respone");
class AccessController {
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
