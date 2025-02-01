const jwt = require("jsonwebtoken");
const { ApiError } = require("../../../httpResponse/httpResponse");

export const checkRoleMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization;
    if (!token) {
      return next(ApiError.UNAUTHORIZED("token expired"));
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (e) {
    next(ApiError.INTERNAL_SERVER_ERROR(e));
  }
};
