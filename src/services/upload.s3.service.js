"use strict";

const { BadRequestResponse } = require("../core/error.response");
const { s3, PutObjectCommand } = require("../configs/aws-s3.config");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const {
  AWS_BUCKET_NAME: bucketName,
  AWS_CLOUDFRONT_DOMAIN: cloudfrontDomain,
  AWS_CLOUDFRONT_PUBLIC_KEY_ID: keyPairId,
  AWS_CLOUDFRONT_PRIVATE_KEY: privateKey,
} = process.env;

const DEFAULT_URL_EXPIRATION = 60 * 60;

class UploadAwsService {
  static async uploadImageFromLocalS3({
    file,
    expiresIn = DEFAULT_URL_EXPIRATION,
  }) {
    try {
      if (!file) {
        throw new BadRequestResponse("No file provided");
      }

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestResponse(
          `Unsupported file type. Allowed types: ${ALLOWED_MIME_TYPES.join(
            ", "
          )}`
        );
      }

      const uniqueFileName = `${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: "inline",
        CacheControl: "max-age=31536000",
      });

      // Upload to S3
      await s3.send(uploadCommand);
      const signedUrl = getSignedUrl({
        url: `${cloudfrontDomain}/${uniqueFileName}`,
        dateLessThan: new Date(Date.now() + expiresIn * 1000),
        keyPairId,
        privateKey,
      });

      return {
        message: "Image uploaded successfully",
        filename: uniqueFileName,
        size: file.size,
        type: file.mimetype,
        url: signedUrl,
        expiresIn,
      };
    } catch (error) {
      console.error("Image upload error:", error);

      if (error instanceof BadRequestResponse) {
        throw error;
      }
      throw new BadRequestResponse(error.message || "Error uploading image");
    }
  }
}

module.exports = UploadAwsService;
