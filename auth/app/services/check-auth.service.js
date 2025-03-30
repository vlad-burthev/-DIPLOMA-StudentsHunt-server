import { configDotenv } from "dotenv";
import { ApiError, ApiResponse } from "../../../httpResponse/httpResponse.js";
import jwt from "jsonwebtoken";
configDotenv();

export const checkAuth = async (req, res, next) => {
  try {
    const user = req.user;
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    if (!token) {
      return next(ApiError.BAD_REQUEST("Не удалось создать токен"));
    }

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
    });

    return ApiResponse.OK(res);
  } catch (error) {
    return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
  }
};
