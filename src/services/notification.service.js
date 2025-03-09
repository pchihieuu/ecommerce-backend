"use strict";

const notificationModel = require("../models/notification.model");
const { convertToObjectId } = require("../utils");

const NOTI_TYPE_CONTENT = {
  "SHOP-001": "Vừa mới thêm một sản phẩm",
  "ORDER-001": "Đặt hàng thành công",
  "ORDER-002": "Đặt hàng thất bại",
  "ORDER-003": "Giao hàng thành công",
  "PROMOTION-001": "Vừa mới thêm voucher mới",
};

class NotificationService {
  static async pushNotiToSystem({
    type = "SHOP-001",
    receivedId = 1,
    senderId = 1,
    options = {},
  }) {
    let noti_content;
    if (type === "SHOP-001") {
      noti_content = `@@@ vừa mới thêm một sản phầm ###`;
    } else if (type === "PROMOTION-001") {
      noti_content = `@@@ vừa mới thêm voucher mới ###`;
    }
    const newNoti = await notificationModel.create({
      noti_content,
      noti_type: type,
      noti_senderId: convertToObjectId(senderId),
      noti_receivedId: convertToObjectId(receivedId),
      noti_options: options,
    });
    return newNoti;
  }

  static async listNotiByUser({ userId = 1, type = "ALL", isRead = 0 }) {
    const match = {
      noti_receivedId: userId,
    };

    // Only filter by type if it's not "ALL"
    if (type !== "ALL") {
      match["noti_type"] = type;
    }

    return await notificationModel.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          noti_type: 1,
          noti_senderId: 1,
          noti_content: {
            $concat: [
              "$noti_options.shop_name",
              " vừa mới thêm một sản phẩm mới: ",
              "$noti_options.product_name",
            ],
          },
          noti_options: 1,
          noti_receivedId: 1,
          createdAt: 1,
        },
      },
    ]);
  }
}

module.exports = NotificationService;
