"use strict";
const { BadRequestResponse } = require("../core/error.response");
const {
  s3,
  PutObjectCommand,
  GetObjectCommand,
} = require("../configs/aws-s3.config");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

class UploadAwsService {
  static async uploadImageFromLocalS3({ file }) {
    try {
      if (!file) {
        throw new BadRequestResponse("No file provided");
      }
      const imageName = `${Date.now()}-${file.originalname}`;
      const commandForPut = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3.send(commandForPut);

      const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
      const privateKey = process.env.AWS_CLOUDFRONT_PRIVATE_KEY;

      // Create signed URL
      const signedUrl = getSignedUrl({
        url: `${cloudfrontDomain}/${imageName}`,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 60),
        keyPairId: process.env.AWS_CLOUDFRONT_PUBLIC_KEY_ID,
        privateKey: privateKey,
      });

      return {
        message: "Image uploaded successfully",
        filename: imageName,
        size: file.size,
        type: file.mimetype,
        url: signedUrl,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestResponse(error.message);
    }
  }
}

module.exports = UploadAwsService;
