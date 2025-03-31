import express from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiError } from "../utils/httpResponse.js";
import { ApiResponse } from "../utils/httpResponse.js";

const router = express.Router();

router.get("/activate/:link", async (req, res, next) => {
  try {
    const { link } = req.params;
    const activatedCompany = await AuthService.activateCompany(link);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Company activated successfully", activatedCompany)
      );
  } catch (error) {
    next(new ApiError(400, error.message));
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    return res
      .status(200)
      .json(new ApiResponse(200, "Login successful", result));
  } catch (error) {
    next(new ApiError(400, error.message));
  }
});

export default router;
