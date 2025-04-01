import express from "express";
import { AdminController } from "./admin.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { adminSchemas } from "./admin.schemas.js";

const router = express.Router();

// Public routes
router.post(
  "/login",
  validateRequest(adminSchemas.loginSchema),
  AdminController.login
);

// Protected routes
router.use(authenticate);

// Company management
router.get(
  "/companies",
  validateRequest(adminSchemas.getCompaniesSchema, "query"),
  AdminController.getCompanies
);

router.patch(
  "/companies/:id/status",
  validateRequest(adminSchemas.updateStatusSchema),
  AdminController.updateCompanyStatus
);

// Student management
router.get(
  "/students",
  validateRequest(adminSchemas.getStudentsSchema, "query"),
  AdminController.getStudents
);

router.patch(
  "/students/:id/status",
  validateRequest(adminSchemas.updateStatusSchema),
  AdminController.updateStudentStatus
);

// System statistics
router.get("/statistics", AdminController.getSystemStatistics);

export const adminRouter = router;
