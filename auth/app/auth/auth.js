import { configDotenv } from "dotenv";
import client from "../../db.config.js";
import { ApiError } from "../httpResponse/httpResponse.js";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { signInService } from "./services/sign-in.service.js";
import { activateUserService } from "./services/activate-user.service.js";
import { checkAuthService } from "./services/check-auth.service.js";

configDotenv();

export class AuthController {
  static authRouter = new Router();

  static async signIn(req, res, next) {
    try {
      const { email } = req.body;

      // Validate email format
      if (!email || !email.includes("@")) {
        return next(ApiError.BAD_REQUEST("Invalid email format"));
      }

      const existedUser = await AuthController.findUserByEmail(email);

      if (!existedUser) {
        return next(ApiError.UNAUTHORIZED("User not found"));
      }

      return await signInService(req, res, next, existedUser);
    } catch (error) {
      console.error("Sign in controller error:", error);
      return next(ApiError.INTERNAL_SERVER_ERROR("Authentication failed"));
    }
  }

  static async activateUser(req, res, next) {
    try {
      return await activateUserService(req, res, next);
    } catch (error) {
      console.error("Activate user error:", error);
      return next(ApiError.INTERNAL_SERVER_ERROR("User activation failed"));
    }
  }

  static async checkAuth(req, res, next) {
    try {
      return await checkAuthService(req, res, next);
    } catch (error) {
      console.error("Check auth error:", error);
      return next(
        ApiError.INTERNAL_SERVER_ERROR("Authentication check failed")
      );
    }
  }

  static async findUserByEmail(email) {
    try {
      const { rows } = await client.query(
        `
          SELECT 'company' as entity_type, id, email, role_id, password, is_activated 
          FROM companies WHERE email = $1
          UNION ALL
          SELECT 'student' as entity_type, id, email, role_id, password, is_activated 
          FROM students WHERE email = $1
          UNION ALL
          SELECT 'admin' as entity_type, id, email, role_id, NULL as password, true as is_activated 
          FROM admins WHERE email = $1
          UNION ALL
          SELECT 'university' as entity_type, id, email, role_id, password, is_activated 
          FROM universities WHERE email = $1
          UNION ALL
          SELECT 'recruiter' as entity_type, id, email, role_id, password, is_activated 
          FROM recruiters WHERE email = $1
        `,
        [email]
      );

      if (!rows.length) {
        return null;
      }

      const user = rows[0];

      // Check if user is active
      if (!user.is_activated) {
        throw new Error("User account is not activated");
      }

      return user;
    } catch (error) {
      console.error("Find user error:", error);
      throw error;
    }
  }
}
