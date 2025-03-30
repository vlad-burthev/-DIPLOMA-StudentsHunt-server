import { Router } from "express";
import { signInValidator } from "./auth.dto.js";
import { AuthController } from "./auth.js";

export const authRoutes = new Router();

authRoutes.use("/sign-in", signInValidator, AuthController.signInController);
