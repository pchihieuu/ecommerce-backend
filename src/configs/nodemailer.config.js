"use strict";

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "email-smtp.ap-southeast-2.amazonaws.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.AWS_EMAIL_APP_USER,
    pass: process.env.AWS_EMAIL_APP_PASSWORD,
  },
});

// Check connection to SMTP
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

module.exports = transporter;
