import { ApiResponse } from "../helpers/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";
import { validationResult } from "express-validator";

export class AuthController {
  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const { user, role } = req;

      const result = await AuthService.login(user, password, role);

      res.cookie("token", result.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      return ApiResponse.OK(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const token = req.cookies.token;
      await AuthService.logout(token);

      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      return ApiResponse.OK(res, { message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }
}
