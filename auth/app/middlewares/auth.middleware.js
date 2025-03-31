import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { ApiError } from "../httpResponse/httpResponse.js";

configDotenv();

export const checkAuthMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.cookies.token;

    if (!token) {
      return next(ApiError.UNAUTHORIZED("Authentication token is required"));
    }

    // Verify token and check if it's expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded || !decoded.id || !decoded.email || !decoded.role_id) {
      return next(ApiError.UNAUTHORIZED("Invalid token format"));
    }

    // Add token expiration check
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return next(ApiError.UNAUTHORIZED("Token has expired"));
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role_id: decoded.role_id,
      entity_type: decoded.entity_type,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.UNAUTHORIZED("Token has expired"));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(ApiError.UNAUTHORIZED("Invalid token"));
    }
    return next(ApiError.INTERNAL_SERVER_ERROR("Authentication error"));
  }
};
