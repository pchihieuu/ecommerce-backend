"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const uploadController = require("../../controllers/upload.controller");
const { uploadToDisk, uploadToMemory } = require("../../configs/multer.config");

// using cloudinary
router.post("/fromUrl", asyncHandler(uploadController.uploadImageFromUrl));
router.post(
  "/fromLocal",
  uploadToDisk.single("file"),
  asyncHandler(uploadController.uploadImageFromLocal)
);
router.post(
  "/multiple/fromLocal",
  uploadToDisk.array("files", 3),
  asyncHandler(uploadController.uploadImagesFromLocal)
);

// using aws s3
router.post(
  "/fromLocal/aws-s3-upload",
  uploadToMemory.single("file"),
  asyncHandler(uploadController.uploadImageFromLocalS3)
);

module.exports = router;
