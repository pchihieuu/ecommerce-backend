"use strict";

const { SuccessResponse } = require("../core/success.response");
const TemplateService = require("../services/template.service");

class TemplateController {
  async createTemplate(req, res, next) {
    const { template_id, template_name, template_html } = req.body;
    new SuccessResponse({
      message: "Template created successfully",
      metadata: await TemplateService.createTemplate({
        template_name,
        template_html,
        template_id,
      }),
    }).send(res);
  }
}

module.exports = new TemplateController();
