import express from "express";
import { VacancyController } from "./vacancy.controller.js";
import { checkAuthMiddleware } from "../../../middlewares/auth.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { vacancySchemas } from "./vacancy.schemas.js";

const router = express.Router();
const vacancyController = new VacancyController();

// Public routes
router.get(
  "/:id",
  validateRequest(vacancySchemas.getVacancySchema, "params"),
  vacancyController.getVacancyById
);

// Protected routes
router.use(checkAuthMiddleware);

router.post(
  "/",
  validateRequest(vacancySchemas.createVacancySchema),
  vacancyController.createVacancy
);

router.put(
  "/:id",
  validateRequest(vacancySchemas.updateVacancySchema),
  vacancyController.updateVacancy
);

router.delete(
  "/:id",
  validateRequest(vacancySchemas.deleteVacancySchema, "params"),
  vacancyController.deleteVacancy
);

router.get(
  "/company/vacancies",
  validateRequest(vacancySchemas.getCompanyVacanciesSchema, "query"),
  vacancyController.getCompanyVacancies
);

router.get(
  "/recruiter/vacancies",
  validateRequest(vacancySchemas.getRecruiterVacanciesSchema, "query"),
  vacancyController.getRecruiterVacancies
);

router.patch(
  "/:id/status",
  validateRequest(vacancySchemas.updateVacancyStatusSchema),
  vacancyController.updateVacancyStatus
);

router.get(
  "/:id/statistics",
  validateRequest(vacancySchemas.getVacancyStatisticsSchema, "params"),
  vacancyController.getVacancyStatistics
);

export default router;
