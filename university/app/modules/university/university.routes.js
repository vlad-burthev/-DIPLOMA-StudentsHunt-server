import express from "express";
import { UniversityController } from "./university.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { universitySchemas } from "./university.schemas.js";
import { checkRole } from "../../../middlewares/role.middleware.js";

const router = express.Router();

// Public routes
router.post(
  "/login",
  validateRequest(universitySchemas.loginSchema),
  UniversityController.login
);

router.post(
  "/register",
  validateRequest(universitySchemas.registerSchema),
  UniversityController.register
);

// Protected routes (require university role)
router.use(authenticate);
router.use(checkRole("UNIVERSITY"));

// University profile management
router.get("/profile", UniversityController.getUniversityById);

router.patch(
  "/profile",
  validateRequest(universitySchemas.updateUniversitySchema),
  UniversityController.updateUniversity
);

// University students management
router.get(
  "/students",
  validateRequest(universitySchemas.getUniversityStudentsSchema, "query"),
  UniversityController.getUniversityStudents
);

// University statistics
router.get("/statistics", UniversityController.getUniversityStatistics);

// Protected routes (require super admin role)
router.use(checkRole("SUPER_ADMIN"));

// University management (super admin only)
router.get(
  "/",
  validateRequest(universitySchemas.getUniversitiesSchema, "query"),
  UniversityController.getUniversities
);

router.get("/:id", UniversityController.getUniversityById);

router.patch(
  "/:id/status",
  validateRequest(universitySchemas.updateUniversityStatusSchema),
  UniversityController.updateUniversityStatus
);

router.delete("/:id", UniversityController.deleteUniversity);

export const universityRouter = router;
