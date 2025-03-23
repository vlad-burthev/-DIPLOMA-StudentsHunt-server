import { Router } from "express";
import { signInValidator } from "./sign-in.dto.js";
import { SignIn } from "./sign-in.js";

export const authRoutes = new Router();

authRoutes.post("/sign-in", signInValidator, SignIn.signIn);
