import { Router } from "express";
import { adminRouter } from "../modules/admin/admin.router.js";

export const mainRouter = new Router();

mainRouter.use("/admin", adminRouter);
