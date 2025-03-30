import { configDotenv } from "dotenv";
import client from "../../../db.config.js";
import { ApiError, ApiResponse } from "../../httpResponse/httpResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

configDotenv();

export class SignIn {
  static async signIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await SignIn.findUserByEmail(email);

      if (!user) {
        return next(ApiError.UNAUTHORIZED("Неправильний email або пароль"));
      }

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

  static async activateUser(req, res, next) {
    try {
      const { activateLink } = req.params;

      // Верифицируем токен активации, чтобы удостовериться, что он действителен
      let decoded;
      try {
        decoded = jwt.verify(activateLink, process.env.JWT_SECRET_KEY);
      } catch (verifyError) {
        return next(
          ApiError.BAD_REQUEST("Ссылка активации недействительна или истекла")
        );
      }
      const email = decoded.email;

      const user = await SignIn.findUserByEmail(email);
      if (!user) {
        return next(ApiError.BAD_REQUEST("Компания не найдена"));
      }

      // Обновляем статус активации компании
      await client.query(
        `UPDATE companies SET activationLink = NULL, activated = TRUE WHERE email = $1`,
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

  static async findUserByEmail(email) {
    try {
      const { rows } = await client.query(
        `
          SELECT 'company' as entity_type, id, email, role_id, password FROM companies WHERE email = $1
          UNION ALL
          SELECT 'student' as entity_type, id, email, role_id, password FROM students WHERE email = $1
          UNION ALL
          SELECT 'admin' as entity_type, id, email, role_id, NULL as password FROM admins WHERE email = $1
          UNION ALL
          SELECT 'university' as entity_type, id, email, role_id, password FROM universities WHERE email = $1
          UNION ALL
          SELECT 'recruiter' as entity_type, id, email, role_id, password FROM recruiters WHERE email = $1
        `,
        [email]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}
