import { ApiError, ApiResponse } from "../../httpResponse/httpResponse.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthController } from "../auth.js";

configDotenv();

export async function signInService(req, res, next, user) {
  try {
    const { password } = req.body;

    // Validate password
    if (!password) {
      return next(ApiError.BAD_REQUEST("Password is required"));
    }

    // Check if user has password (for admin users who might not have password)
    if (!user.password) {
      return next(
        ApiError.UNAUTHORIZED(
          "Invalid authentication method for this user type"
        )
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(ApiError.UNAUTHORIZED("Invalid email or password"));
    }

    // Generate JWT token with additional security claims
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        entity_type: user.entity_type,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
      },
      process.env.JWT_SECRET_KEY,
      {
        algorithm: "HS256",
        jwtid: `${user.id}-${Date.now()}`, // Unique token ID
      }
    );

    // Set secure cookie with additional security options
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = user;

    return ApiResponse.OK(res, {
      message: "Successfully authenticated",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return next(ApiError.INTERNAL_SERVER_ERROR("Authentication failed"));
  }
}
