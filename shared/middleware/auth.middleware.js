import { AuthService } from "../services/auth.service.js";
import ApiError from "../helpers/ApiError.js";

export const authenticate = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token =
        req.cookies.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new ApiError(401, "Authentication required");
      }

      const decoded = AuthService.verifyToken(token);

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        throw new ApiError(403, "Access denied");
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
