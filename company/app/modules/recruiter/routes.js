import { Router } from "express";
import { RecruiterController } from "./recruiter.controller.js";
import { createVacancyValidator } from "./recruiter.dto.js";
import { checkAuthMiddleware } from "../../middlewares/auth.middleware.js";
import { checkRoleMiddleware } from "../../../../authModule/app/middlewares/role.middleware.js";

export const recruiterRoutes = new Router();

recruiterRoutes.post(
  "/create_vacancy",
  checkAuthMiddleware,
  createVacancyValidator,
  RecruiterController.createVacancy
);

recruiterRoutes.get(
  "/get_all_company_recruiters",
  checkRoleMiddleware(2),
  RecruiterController.getAllCompanyRecruiters
);

recruiterRoutes.post(
  "/delete_recruiter",
  checkRoleMiddleware(2),
  RecruiterController.deleteRecruiter
);

recruiterRoutes.post("/login_recruiter", RecruiterController.loginRecruiter);
