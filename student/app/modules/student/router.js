import { Router } from "express";
import multer from "multer";
import { StudentController } from "./student.controller.js";

export const studentRoutes = new Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

studentRoutes.post("/create_student", StudentController.createSudent);

// studentRoutes.post(
//   "/create_student",
//   upload.single("photo"),
//   createCompanyValidator,
//   CompanyController.createCompany
// );

// companyRoutes.post("/login", CompanyController.loginCompany);

// companyRoutes.get("/activate/:activateLink", CompanyController.activateCompany);
// companyRoutes.post(
//   "/create_recruiter",
//   upload.single("photo"),
//   checkRoleMiddleware(2),
//   createRecruiterValidator,
//   createRecruiterService
// );
// companyRoutes.get("/check", checkUserAuth);
