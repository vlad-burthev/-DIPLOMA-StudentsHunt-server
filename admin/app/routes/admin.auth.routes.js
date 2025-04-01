import express from "express";
import { AuthController } from "../../../shared/controllers/auth.controller.js";
import { loginSchema } from "../../../shared/schemas/auth.schemas.js";
import { validateRequest } from "../../../shared/middleware/validate.middleware.js";
import { authenticate } from "../../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/logout", authenticate(["admin"]), AuthController.logout);

export default router;
