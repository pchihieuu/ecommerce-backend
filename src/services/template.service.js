"use strict";

const { generateTemplateHtml } = require("../utils/template.html");
const {
  BadRequestResponse,
  NotFoundResponse,
} = require("../core/error.response");
const templateModel = require("../models/template.model");

class TemplateService {
  static async createTemplate({
    template_id = null,
    template_name = null,
    template_html = null,
  }) {
    const template = await templateModel
      .findOne({ template_name })
      .lean()
      .exec();
    if (template) {
      throw new BadRequestResponse("Template name already exists");
    }

    const templateHtml = template_html || generateTemplateHtml();

    const newTemplate = await templateModel.create({
      template_id,
      template_name,
      template_html: templateHtml,
    });

    return newTemplate;
  }

  static async getTemplate({ template_name = null }) {
    const template = await templateModel
      .findOne({ template_name })
      .lean()
      .exec();
    if (!template) {
      throw new NotFoundResponse("Template not found");
    }
    return template;
  }
}

module.exports = TemplateService;
