const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/company.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const multer = require("multer");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Recruiter Management Routes
router.post(
  "/recruiters",
  authenticateToken,
  upload.single("photo"),
  CompanyController.createRecruiter
);
router.put(
  "/recruiters/:recruiterId",
  authenticateToken,
  upload.single("photo"),
  CompanyController.updateRecruiter
);
router.delete(
  "/recruiters/:recruiterId",
  authenticateToken,
  CompanyController.deleteRecruiter
);

// Company Statistics Route
router.get(
  "/statistics",
  authenticateToken,
  CompanyController.getCompanyStatistics
);

// Company Profile Management Routes
router.put(
  "/profile",
  authenticateToken,
  upload.single("photo"),
  CompanyController.updateCompanyProfile
);
router.delete(
  "/profile",
  authenticateToken,
  CompanyController.deleteCompanyProfile
);

module.exports = router;
