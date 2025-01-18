import { Router } from "express";
import {
  authenticate,
  authenticateCallback,
  logout,
} from "./admin.controller.js";

export const adminRouter = new Router();

adminRouter.get("/auth/google", authenticate);
adminRouter.get("/google/callback", authenticateCallback);
adminRouter.get("/logout", logout);
