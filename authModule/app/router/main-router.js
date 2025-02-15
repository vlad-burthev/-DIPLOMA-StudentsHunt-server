import { Router } from "express";
import { companyRoutes } from "../modules/company/routes.js";
import { recruiterRoutes } from "../modules/recruiter/routes.js";

export const mainRouter = new Router();

mainRouter.use("/company", companyRoutes);
mainRouter.use("/recruiter", recruiterRoutes);
