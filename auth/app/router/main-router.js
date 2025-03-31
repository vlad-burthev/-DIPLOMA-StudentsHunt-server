import { Router } from "express";

import { authRoutes } from "../auth/routes.js";

export const mainRouter = new Router();

mainRouter.use("/auth", authRoutes);
