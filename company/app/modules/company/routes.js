import { Router } from "express";
import { CompanyController } from "./company.controller.js";
import multer from "multer";
import { checkRoleMiddleware } from "../../middlewares/role.middleware.js";
import { createCompanyValidator } from "./company.dto.js";

export const companyRoutes = new Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

companyRoutes.post(
  "/create_company",
  upload.single("photo"),
  createCompanyValidator,
  CompanyController.createCompany
);

companyRoutes.post("/login", CompanyController.loginCompany);

companyRoutes.get("/activate/:activateLink", CompanyController.activateCompany);
