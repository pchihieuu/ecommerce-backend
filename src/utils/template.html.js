"use strict";

const generateTemplateHtml = () => {
  return `
  <div style="max-width: 700px; margin: auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase; color: teal;">Xác thực tài khoản email của bạn</h2>
        <p>Chào mừng bạn đến với dịch vụ của chúng tôi.</p>
        <p>Vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
        <div style="text-align: center;">
          <a href="{{verify_link}}"
             style="background: crimson;
                    text-decoration: none;
                    color: white;
                    padding: 10px 20px;
                    margin: 10px 0;
                    display: inline-block;">
            Xác thực email
          </a>
        </div>
        <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
        <div>{{verify_link}}</div>
        <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
        <p>Nếu bạn không yêu cầu xác thực email này, vui lòng bỏ qua email này.</p>
      </div>
    `;
};

const replacePlaceholder = (template, params) => {
  Object.keys(params).forEach((key) => {
    const placeholder = `{{${key}}}`;
    if (template.includes(placeholder)) {
      template = template.replace(new RegExp(placeholder, "g"), params[key]);
    }
  });
  return template;
};

module.exports = {
  generateTemplateHtml,
  replacePlaceholder,
};
