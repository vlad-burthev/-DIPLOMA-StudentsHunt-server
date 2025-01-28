import { Router } from "express";
import { CompanyController } from "./company.controller.js";
import multer from "multer";

export const companyRoutes = new Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

companyRoutes.post(
  "/create_company",
  upload.single("photo"),
  CompanyController.createCompany
);
