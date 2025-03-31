import multer from "multer";
import { configDotenv } from "dotenv";

configDotenv();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP files are allowed."
      ),
      false
    );
    return;
  }

  if (file.size > maxSize) {
    cb(new Error("File size too large. Maximum size is 5MB."), false);
    return;
  }

  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File size too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  next();
};
