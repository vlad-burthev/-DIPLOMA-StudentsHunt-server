import express from "express";
import { CompanyController } from "./company.controller.js";

import { validateRequest } from "../../middlewares/validate.middleware.js";
import { companySchemas } from "./company.schemas.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { checkAuthMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();
const companyController = new CompanyController();

// Public routes
router.post(
  "/register",
  upload.single("photo"),
  validateRequest(companySchemas.registerSchema),
  companyController.createCompany
);

router.get(
  "/:id",
  validateRequest(companySchemas.getCompanySchema, "params"),
  companyController.getCompanyById
);

router.get(
  "/",
  validateRequest(companySchemas.getCompaniesSchema, "query"),
  companyController.getCompanies
);

// Protected routes
router.use(checkAuthMiddleware);

router.put(
  "/:id",
  upload.single("photo"),
  validateRequest(companySchemas.updateCompanySchema),
  companyController.updateCompany
);

router.delete(
  "/:id",
  validateRequest(companySchemas.deleteCompanySchema, "params"),
  companyController.deleteCompany
);

router.get(
  "/:id/vacancies",
  validateRequest(companySchemas.getCompanyVacanciesSchema, "query"),
  companyController.getCompanyVacancies
);

router.get(
  "/:id/recruiters",
  validateRequest(companySchemas.getCompanyRecruitersSchema, "query"),
  companyController.getCompanyRecruiters
);

router.patch(
  "/:id/status",
  validateRequest(companySchemas.updateCompanyStatusSchema),
  companyController.updateCompanyStatus
);

router.get(
  "/:id/statistics",
  validateRequest(companySchemas.getCompanyStatisticsSchema, "params"),
  companyController.getCompanyStatistics
);

export default router;
