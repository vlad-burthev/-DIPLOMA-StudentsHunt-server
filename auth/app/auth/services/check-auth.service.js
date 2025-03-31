import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import { ApiError, ApiResponse } from "../../httpResponse/httpResponse.js";
import { AuthController } from "../auth.js";

configDotenv();

export async function checkAuthService(req, res, next) {
  try {
    const user = req.user;

    // Verify user data
    if (!user || !user.id || !user.email || !user.role_id) {
      return next(ApiError.UNAUTHORIZED("Invalid user data"));
    }

    // Check if token needs refresh (if it's older than 45 minutes)
    const tokenExp = user.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const shouldRefresh = tokenExp && tokenExp - currentTime < 900; // 15 minutes threshold

    if (!shouldRefresh) {
      return ApiResponse.OK(res, {
        message: "Authentication valid",
        user: {
          id: user.id,
          email: user.email,
          role_id: user.role_id,
          entity_type: user.entity_type,
        },
      });
    }

    // Generate new token with refreshed expiration
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        entity_type: user.entity_type,
        iat: currentTime,
        exp: currentTime + 60 * 60, // 1 hour
      },
      process.env.JWT_SECRET_KEY,
      {
        algorithm: "HS256",
        jwtid: `${user.id}-${Date.now()}`,
      }
    );

    // Set new secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    return ApiResponse.OK(res, {
      message: "Token refreshed",
      user: {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        entity_type: user.entity_type,
      },
    });
  } catch (error) {
    console.error("Check auth error:", error);
    return next(ApiError.INTERNAL_SERVER_ERROR("Authentication check failed"));
  }
}
