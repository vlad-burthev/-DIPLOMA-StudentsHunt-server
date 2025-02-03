import { Router } from "express";
import { universityRoutes } from "../modules/university/routes.js";

export const mainRouter = new Router();

mainRouter.use("/university", universityRoutes);
