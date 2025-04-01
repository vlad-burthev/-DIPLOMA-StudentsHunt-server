import { ApiError } from "../../httpResponse/httpResponse.js";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import { AuthController } from "../auth.js";
import client from "../../../db.config.js";

configDotenv();

export async function activateUserService(req, res, next) {
  try {
    const { activateLink } = req.params;

    let decoded;
    try {
      decoded = jwt.verify(activateLink, process.env.JWT_SECRET_KEY);
    } catch (verifyError) {
      return next(
        ApiError.BAD_REQUEST("Ссылка активации недействительна или истекла")
      );
    }
    const email = decoded.email;

    const user = await AuthController.findUserByEmail(email);
    if (!user) {
      console.log("here");
      return next(ApiError.BAD_REQUEST("Компания не найдена"));
    }

    // Обновляем статус активации компании
    await client.query(
      `UPDATE companies SET activationLink = NULL, is_activated = TRUE WHERE email = $1`,
      [email]
    );

    // Генерируем токен для сессии после активации
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    req.user = user;
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "strict",
    });

    return res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.error("Ошибка активации usera:", error.message);
    return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
  }
}
