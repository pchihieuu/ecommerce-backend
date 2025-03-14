"use strict";

const { BadRequestResponse } = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");

class UploadService {
  static async uploadImageFromUrl({ url }) {
    try {
      const urlImage = url;
      const folderName = "product/upload";
      const fileName = "product_image.jpg";
      const result = await cloudinary.uploader.upload(urlImage, {
        public_id: fileName,
        folder: folderName,
        use_filename: true,
        overwrite: true,
      });

      return {
        url: result.secure_url,
      };
    } catch (error) {
      console.error("Error uploading image", error);
      throw new BadRequestResponse(error.message);
    }
  }

  static async uploadImageFromLocal({ path, folderName = "products/upload" }) {
    try {
      const fileName = "product_image";
      const result = await cloudinary.uploader.upload(path, {
        folder: folderName,
        public_id: fileName,
        use_filename: true,
        overwrite: true,
      });

      return {
        url: result.secure_url,
      };
    } catch (error) {
      console.error("Error uploading image", error);
      throw new BadRequestResponse(error.message);
    }
  }

  static async uploadImagesFromLocal({
    files,
    folderName = "products/upload",
  }) {
    try {
      if (!files.length) return;

      const uploaded_urls = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: folderName,
          use_filename: true,
          overwrite: true,
        });
        uploaded_urls.push(result.secure_url);
      }

      return {
        uploaded_urls,
      };
    } catch (error) {
      console.error("Error uploading images", error);
      throw new BadRequestResponse(error.message);
    }
  }
}

module.exports = UploadService;
