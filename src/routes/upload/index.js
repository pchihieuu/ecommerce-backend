"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const uploadController = require("../../controllers/upload.controller");
const { uploadToDisk } = require("../../configs/multer.config");
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

module.exports = router;
