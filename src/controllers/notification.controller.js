"use strict";

const { SuccessResponse } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {
  async getListNotiByUser(req, res, next) {
    new SuccessResponse({
      message: "Get list notifications by user successfully",
      metadata: await NotificationService.listNotiByUser(req.query),
    }).send(res);
  }
}

module.exports = new NotificationController();
