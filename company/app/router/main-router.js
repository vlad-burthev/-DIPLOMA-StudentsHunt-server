import { Router } from "express";
import { companyRoutes } from "../modules/company/routes.js";

export const mainRouter = new Router();

mainRouter.use("/company", companyRoutes);
