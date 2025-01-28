import { Router } from "express";
import { CompanyController } from "./company.controller.js";

export const companyRoutes = new Router();

companyRoutes.post("/create_company", CompanyController.createCompany);
