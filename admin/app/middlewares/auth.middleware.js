const jwt = require("jsonwebtoken");
const { ApiError } = require("../../../httpResponse/httpResponse");

const checkRoleMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
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
