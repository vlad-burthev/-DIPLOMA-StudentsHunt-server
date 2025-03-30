import { ApiError, ApiResponse } from "../../httpResponse/httpResponse.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

configDotenv();

export async function signInService(req, res, next, user) {
  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(ApiError.UNAUTHORIZED("Неправильный email или пароль"));
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    req.user = user;

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
    });

    return ApiResponse.OK(res, { message: "Авторизовано" });
  } catch (error) {
    return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
  }
}
