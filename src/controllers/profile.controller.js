"use strict";

const { SuccessResponse } = require("../core/success.response");

const dataProfiles = [
  {
    user_id: 1,
    user_name: "CR7",
    user_avatar:
      "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    user_email: "cr7@gmail.com",
    user_phone: "08575790826",
    user_address: "123 Main St, Anytown, USA",
    user_role: "admin",
  },
  {
    user_id: 2,
    user_name: "Messi",
    user_avatar:
      "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    user_email: "messi@gmail.com",
    user_phone: "08575790821",
    user_address: "123 Main St, Anytown, USA",
    user_role: "admin",
  },
  {
    user_id: 3,
    user_name: "Ronaldo",
    user_avatar:
      "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    user_email: "ronaldo@gmail.com",
    user_phone: "08575790822",
    user_address: "123 Main St, Anytown, USA",
    user_role: "admin",
  },
];

class ProfileController {
  // admin
  profiles = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: dataProfiles,
    }).send(res);
  };

  // shop
  profile = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: {
        user_id: 2,
        user_name: "Messi",
        user_avatar:
          "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
        user_email: "messi@gmail.com",
        user_phone: "08575790821",
        user_address: "123 Main St, Anytown, USA",
        user_role: "admin",
      },
    }).send(res);
  };
}

module.exports = new ProfileController();
