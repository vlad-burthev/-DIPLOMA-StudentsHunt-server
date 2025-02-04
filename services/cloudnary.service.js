import { v2 as cloudinary } from "cloudinary";
import { configDotenv } from "dotenv";
import sharp from "sharp";

configDotenv();

class CloudinaryService {
  constructor() {
    // Инициализация конфигурации Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Метод загрузки изображения
  static async uploadImage(file, dir, resourceType) {
    try {
      const processedImageBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: dir,
              resource_type: resourceType,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error details:", error);
                reject(
                  new Error(`Ошибка загрузки на Cloudinary: ${error.message}`)
                );
              } else {
                resolve(result);
              }
            }
          )
          .end(processedImageBuffer);
      });
    } catch (error) {
      console.error("Image processing or upload error:", error.message);
      throw new Error(`Ошибка обработки изображения: ${error.message}`);
    }
  }

  // Метод загрузки изображения
  static async deleteImage(publicId, resourceType = "image") {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      if (result.result !== "ok") {
        throw new Error(`Ошибка удаления изображения: ${result.result}`);
      }

      return result;
    } catch (error) {
      console.error("Cloudinary delete error details:", error);
      throw new Error(`Ошибка удаления изображения: ${error.message}`);
    }
  }
}

export default CloudinaryService;
