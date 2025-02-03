import * as jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();

export const checkRoleMiddleware = (req, res, next) => {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }
    try {
      const token = req.headers.authorization.split(" ")[1]; // Bearer asfasnfkajsfnjk
      if (!token) {
        return res.status(401).json({ message: "Не авторизован" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded.role !== role) {
        return res.status(403).json({ message: "Нет доступа" });
      }
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ message: "Не авторизован" });
    }
  };
};
