import express from "express";
import { ApplicationController } from "./application.controller.js";
import { checkAuthMiddleware } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { applicationSchemas } from "./application.schemas.js";

const router = express.Router();
const applicationController = new ApplicationController();

// Protected routes
router.use(checkAuthMiddleware);

router.post(
  "/vacancies/:vacancyId",
  validateRequest(applicationSchemas.createApplicationSchema),
  applicationController.createApplication
);

router.get(
  "/:id",
  validateRequest(applicationSchemas.getApplicationSchema, "params"),
  applicationController.getApplicationById
);

router.patch(
  "/:id/status",
  validateRequest(applicationSchemas.updateApplicationStatusSchema),
  applicationController.updateApplicationStatus
);

router.delete(
  "/:id",
  validateRequest(applicationSchemas.deleteApplicationSchema, "params"),
  applicationController.deleteApplication
);

router.get(
  "/vacancies/:vacancyId",
  validateRequest(applicationSchemas.getVacancyApplicationsSchema, "query"),
  applicationController.getVacancyApplications
);

router.get(
  "/student/applications",
  validateRequest(applicationSchemas.getStudentApplicationsSchema, "query"),
  applicationController.getStudentApplications
);

export default router;
