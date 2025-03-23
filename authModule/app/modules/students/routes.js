import { Router } from "express";
import { StudentController } from "./student.controller.js";
import { createStudentValidator } from "./student.dto.js";
import { checkAuthMiddleware } from "../../middlewares/auth.middleware.js";

export const recruiterRoutes = new Router();

recruiterRoutes.post(
  "/create_student",
  checkAuthMiddleware,
  createStudentValidator,
  StudentController.createVacancy
);

recruiterRoutes.post("/login_student", StudentController.loginRecruiter);
