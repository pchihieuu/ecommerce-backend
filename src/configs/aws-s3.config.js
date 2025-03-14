"use strict";

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

const S3Config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_KEY,
  },
};

const s3 = new S3Client(S3Config);

module.exports = {
  s3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
};
