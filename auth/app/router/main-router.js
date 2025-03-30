import { Router } from "express";

import { checkAuthMiddleware } from "../middlewares/auth.middleware.js";
import { checkAuth } from "../services/check-auth.service.js";
import { authRoutes } from "../auth/routes.js";

export const mainRouter = new Router();

mainRouter.get("/check-auth", checkAuthMiddleware, checkAuth);

mainRouter.use("/auth", authRoutes);
