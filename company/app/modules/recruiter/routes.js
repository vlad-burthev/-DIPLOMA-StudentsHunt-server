import { Router } from "express";
import { RecruiterController } from "./recruiter.controller.js";
import { createVacancyValidator } from "./recruiter.dto.js";
import { checkAuthMiddleware } from "../../middlewares/auth.middleware.js";

export const recruiterRoutes = new Router();

recruiterRoutes.post(
  "/create_vacancy",
  checkAuthMiddleware,
  createVacancyValidator,
  RecruiterController.createVacancy
);

recruiterRoutes.post("/login_recruiter", RecruiterController.loginRecruiter);
