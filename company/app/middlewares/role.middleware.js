import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { ApiError } from "../../../httpResponse/httpResponse.js";
configDotenv();

export const checkRoleMiddleware = (roleId) => {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Не авторизован" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded.role_id !== roleId) {
        return res.status(403).json({ message: "Нет доступа" });
      }
      req.user = decoded;

      next();
    } catch (e) {
      console.log(e);
      return next(ApiError.INTERNAL_SERVER_ERROR(e.message));
    }
  };
};
