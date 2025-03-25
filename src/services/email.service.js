"use strict";

const {
  NotFoundResponse,
  BadRequestResponse,
} = require("../core/error.response");
const OtpService = require("./otp.service");
const TemplateService = require("./template.service");
const { replacePlaceholder } = require("../utils/template.html");
const transporter = require("../configs/nodemailer.config");
const crypto = require("crypto");

class EmailService {
  static sendEmailUsingThridParty({
    toEmail = null,
    html = null,
    subject = "Xác thực tài khoản email của bạn",
  }) {
    return new Promise((resolve, reject) => {
      try {
        transporter.sendMail(
          {
            from:
              process.env.EMAIL_FROM || ' "Ecommerce" <hieup3611@gmail.com>',
            to: toEmail,
            subject,
            html,
          },
          (error, info) => {
            if (error) {
              console.error("Email sending error:", error);
              return reject(new BadRequestResponse("Failed to send email"));
            }
            console.log("Email sent: %s", info.messageId);
            return resolve(info);
          }
        );
      } catch (error) {
        console.error("Email service error:", error);
        reject(new BadRequestResponse("Failed to send email"));
      }
    });
  }

  static async sendEmail({ email = null, password = null }) {
    try {
      if (!email) {
        throw new BadRequestResponse("Email is required");
      }

      if (!password) {
        password = crypto.randomBytes(10).toString("hex");
      }

      const otp = await OtpService.newOtp({ email, password });

      const template = await TemplateService.getTemplate({
        template_name: "HTML_EMAIL_TOKEN",
      });

      if (!template) {
        throw new NotFoundResponse("Template not found");
      }
      const html = replacePlaceholder(template.template_html, {
        verify_link: `http://localhost:3000/api/v1/user/verify-email?email=${email}&token=${otp.otp_token}`,
      });

      // send email
      await EmailService.sendEmailUsingThridParty({
        toEmail: email,
        html: html,
        subject: "Xác thực tài khoản email của bạn",
      });

      return {
        message: "Email sent successfully, please check your email",
      };
    } catch (error) {
      console.error("Send email error:", error);
      throw error.status
        ? error
        : new BadRequestResponse("Failed to send email");
    }
  }
}
/* Khi trỏ đến đường dẫn verify, khi đường link được check tạo ra user => bao gồm accesstoken và refreshToken 
để khi người dùng có biến đó ngta lưu vào key app
 hoặc store thẳng vào app luôn => đi thằng vào profile, 
sau đó gửi 1 email tạo ra password tạm thời cho người dùng trong bao lâu?*/
module.exports = EmailService;
