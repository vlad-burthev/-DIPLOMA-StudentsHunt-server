import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";

configDotenv();

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file, folder, resourceType = "image") {
    try {
      // Convert buffer to base64
      const base64String = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${base64String}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `companies/${folder}`,
        resource_type: resourceType,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
        ],
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
      };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async updateImage(publicId, file, folder) {
    try {
      // Delete old image
      await this.deleteImage(publicId);

      // Upload new image
      const result = await this.uploadImage(file, folder);
      return result;
    } catch (error) {
      throw new Error(`Failed to update image: ${error.message}`);
    }
  }

  generateImageUrl(publicId, options = {}) {
    try {
      const {
        width = 800,
        height = 800,
        crop = "limit",
        quality = "auto",
        format = "auto",
      } = options;

      return cloudinary.url(publicId, {
        width,
        height,
        crop,
        quality,
        format,
      });
    } catch (error) {
      throw new Error(`Failed to generate image URL: ${error.message}`);
    }
  }
}
