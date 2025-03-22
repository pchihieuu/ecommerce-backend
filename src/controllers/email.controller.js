"use strict";

const { SuccessResponse } = require("../core/success.response");
const EmailService = require("../services/email.service");

class EmailController {
  static async sendEmail(req, res, next) {
    const email = req.body;
    new SuccessResponse({
      message: "Email sent successfully",
      metadata: await EmailService.sendEmail({ email }),
    }).send(res);
  }
}

module.exports = EmailController;
