import { Router } from "express";
import { signInValidator } from "./auth.dto.js";
import { AuthController } from "./auth.js";
import { checkAuthMiddleware } from "../middlewares/auth.middleware.js";

export const authRoutes = new Router();

authRoutes.post("/sign-in", signInValidator, AuthController.signIn);
authRoutes.get("/activate/:activationLink", AuthController.activateUser);
authRoutes.post("/check", checkAuthMiddleware, AuthController.checkAuth);
