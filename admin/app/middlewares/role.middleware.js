import { ApiError } from "../utils/httpResponse.js";

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized");
      }

      const userRole = req.user.entity_type;
      if (!allowedRoles.includes(userRole)) {
        throw new ApiError(403, "Access denied. Insufficient permissions.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
