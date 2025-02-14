"use strict";

const AccessService = require("../services/access.service");
const { CREATED } = require("../core/success.respone");

class AccessController {
  static async signUp(req, res, next) {
    try {
      const metadata = await AccessService.signUp(req.body);

      return CREATED.send(res, {
        message: "Shop registered successfully!",
        metadata,
        options: {
          limit: 10,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AccessController;
