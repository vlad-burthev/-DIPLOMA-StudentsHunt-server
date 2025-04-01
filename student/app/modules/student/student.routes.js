import express from "express";
import multer from "multer";
import { StudentController } from "./student.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { studentSchemas } from "./student.schemas.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
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

// Public routes
router.post(
  "/register",
  validateRequest(studentSchemas.registerSchema),
  StudentController.register
);

router.post(
  "/login",
  validateRequest(studentSchemas.loginSchema),
  StudentController.login
);

// Protected routes
router.use(authenticate);

// Profile management
router.get("/profile", StudentController.getProfile);

router.patch(
  "/profile",
  validateRequest(studentSchemas.updateProfileSchema),
  StudentController.updateProfile
);

router.post(
  "/profile/photo",
  upload.single("photo"),
  StudentController.uploadPhoto
);

// Applications management
router.get(
  "/applications",
  validateRequest(studentSchemas.getApplicationsSchema, "query"),
  StudentController.getApplications
);

router.post(
  "/vacancies/:vacancyId/apply",
  validateRequest(studentSchemas.applyForVacancySchema),
  StudentController.applyForVacancy
);

router.delete(
  "/applications/:applicationId",
  StudentController.deleteApplication
);

export const studentRouter = router;
