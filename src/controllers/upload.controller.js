"use strict";

const UploadAwsService = require("../services/upload.s3.service");
const { BadRequestResponse } = require("../core/error.response");
const { SuccessResponse } = require("../core/success.response");
const UploadService = require("../services/upload.service");

class UploadController {
  async uploadImageFromUrl(req, res, next) {
    new SuccessResponse({
      message: "Upload image from url successfully",
      metadata: await UploadService.uploadImageFromUrl(req.body),
    }).send(res);
  }

  async uploadImageFromLocal(req, res, next) {
    const { file } = req;
    if (!file || file.length === 0) {
      throw new BadRequestResponse("Error uploading image from local");
    }
    new SuccessResponse({
      message: "Upload image from local successfully",
      metadata: await UploadService.uploadImageFromLocal({
        path: file.path,
      }),
    }).send(res);
  }

  async uploadImagesFromLocal(req, res, next) {
    const { files } = req;
    if (!files || files.length === 0) {
      throw new BadRequestResponse("Error uploading images from local");
    }
    new SuccessResponse({
      message: "Upload images from local successfully",
      metadata: await UploadService.uploadImagesFromLocal({
        files,
      }),
    }).send(res);
  }
  async uploadImageFromLocalS3(req, res, next) {
    const { file } = req;
    if (!file) {
      throw new BadRequestResponse("Error uploading images from local");
    }
    new SuccessResponse({
      message: "Upload images from local to S3 successfully",
      metadata: await UploadAwsService.uploadImageFromLocalS3({
        file,
      }),
    }).send(res);
  }
}

module.exports = new UploadController();
