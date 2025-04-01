import express from "express";
import { SuperAdminController } from "./super-admin.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { superAdminSchemas } from "./super-admin.schemas.js";
import { checkRole } from "../../../middlewares/role.middleware.js";

const router = express.Router();

// Public routes
router.post(
  "/login",
  validateRequest(superAdminSchemas.loginSchema),
  SuperAdminController.login
);

// Protected routes (require super admin role)
router.use(authenticate);
router.use(checkRole("SUPER_ADMIN"));

// Admin management
router.post(
  "/admins",
  validateRequest(superAdminSchemas.createAdminSchema),
  SuperAdminController.createAdmin
);

router.get(
  "/admins",
  validateRequest(superAdminSchemas.getAdminsSchema, "query"),
  SuperAdminController.getAdmins
);

router.patch(
  "/admins/:id/status",
  validateRequest(superAdminSchemas.updateAdminStatusSchema),
  SuperAdminController.updateAdminStatus
);

router.delete("/admins/:id", SuperAdminController.deleteAdmin);

// System management
router.get("/statistics", SuperAdminController.getSystemStatistics);

router.get(
  "/logs",
  validateRequest(superAdminSchemas.getSystemLogsSchema, "query"),
  SuperAdminController.getSystemLogs
);

router.get("/settings", SuperAdminController.getSystemSettings);

router.patch(
  "/settings",
  validateRequest(superAdminSchemas.updateSystemSettingsSchema),
  SuperAdminController.updateSystemSettings
);

export const superAdminRouter = router;
