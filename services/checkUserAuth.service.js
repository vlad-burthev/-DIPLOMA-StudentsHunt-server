import { getUserFromAllTables } from "../commom/helpers/getUserFromAllTables.helpers.js";
import { ApiError, ApiResponse } from "../httpResponse/httpResponse.js";
import jwt from "jsonwebtoken";

export const checkUserAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return next(ApiError.NOT_FOUND("Немає токену"));
    }

    const userInfoFromToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!userInfoFromToken) {
      return next(ApiError.NOT_FOUND("У токена закінчився термін дії"));
    }

    const existedUser = await getUserFromAllTables(decoded.email);
    req.user = existedUser;
    const newToken = jwt.sign(
      {
        id: existedUser.id,
        email: existedUser.email,
        role_id: existedUser.role_id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", newToken, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
    });

    return ApiResponse.OK();
  } catch (error) {
    return next(ApiError.UNAUTHORIZED(error.message));
  }
};
