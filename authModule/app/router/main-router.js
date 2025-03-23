import { Router } from "express";
import { companyRoutes } from "../modules/company/routes.js";
import { recruiterRoutes } from "../modules/recruiter/routes.js";
import { checkAuthMiddleware } from "../middlewares/auth.middleware.js";
import { checkAuth } from "../services/check-auth.service.js";
import { authRoutes } from "../modules/sign-in/routes.js";

export const mainRouter = new Router();

mainRouter.use("/company", companyRoutes);
mainRouter.use("/recruiter", recruiterRoutes);

mainRouter.get("/check-auth", checkAuthMiddleware, checkAuth);

mainRouter.use("/auth", authRoutes);
