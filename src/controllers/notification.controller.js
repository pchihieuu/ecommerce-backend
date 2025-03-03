"use strict";

const { SuccessRespone } = require("../core/success.respone");
const NotificationService = require("../services/notification.service");

class NotificationController {
  async getListNotiByUser(req, res, next) {
    new SuccessRespone({
      message: "Get list notifications by user successfully",
      metadata: await NotificationService.listNotiByUser(req.query),
    }).send(res);
  }
}

module.exports = new NotificationController();
