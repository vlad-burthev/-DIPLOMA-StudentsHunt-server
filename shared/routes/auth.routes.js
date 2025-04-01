import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { loginSchema } from "../schemas/auth.schemas.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);

export default router;
