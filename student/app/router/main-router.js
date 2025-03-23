import { Router } from "express";
import { studentRoutes } from "../modules/student/router.js";

export const mainRouter = new Router();

mainRouter.use("/student", studentRoutes);
