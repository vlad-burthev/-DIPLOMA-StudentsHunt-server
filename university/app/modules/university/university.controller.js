import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import * as bcrypt from "bcrypt";
import CloudinaryService from "../../../../services/cloudnary.service.js";
import { checkEGRPOUCode } from "../../../../services/egrpou.service.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { MailService } from "../../../../services/mail.service.js";
import { validationResult } from "express-validator";
configDotenv();

export class UniversityController {
  static async createUniversity(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const queryGetCompanyByTitle = `
          SELECT * FROM companies_info
          WHERE title = $1
        `;

      const queryGetCompanyByEgrpou = `
          SELECT * FROM egrpou_info
          WHERE egrpou = $1
        `;

      const { companyByEmail } =
        await CompanyController.checkRegistratedAccByEmail(req.body.email);

      const { rowCount: rowCountByInfo } = await client.query(
        queryGetCompanyByTitle,
        [req.body.title]
      );

      const { rowCount: rowCountByEgrpou } = await client.query(
        queryGetCompanyByEgrpou,
        [req.body.egrpou]
      );

      if (companyByEmail > 0 || rowCountByInfo > 0 || rowCountByEgrpou > 0) {
        return next(
          ApiError.UNAUTHORIZED(
            "Аккаунт з таким email або назвою чи ЄДРПОУ вже існує"
          )
        );
      }

      const egrpouInfo = await checkEGRPOUCode(req.body.egrpou);
      const activationLink = jwt.sign(
        req.body.email,
        process.env.JWT_SECRET_KEY
      );

      if (egrpouInfo instanceof Error) {
        return next(ApiError.BAD_REQUEST(egrpouInfo.message));
      }

      if (!req.file) {
        return next(ApiError.BAD_REQUEST("Файл не знайдено"));
      }

      let photoUrl = null;
      try {
        const result = await CloudinaryService.uploadImage(
          req.file,
          "company",
          "image"
        );
        photoUrl = result.secure_url;
      } catch (uploadError) {
        return next(
          ApiError.INTERNAL_SERVER_ERROR("Помилка завантаження фото")
        );
      }

      const queryInsertCompany = `
          INSERT INTO companies (
            email, password, activationLink
          ) VALUES (
            $1, $2, $3
          ) RETURNING *;
        `;

      const values = [
        req.body.email,
        bcrypt.hashSync(req.body.password, 5),
        activationLink,
      ];

      const { rows } = await client.query(queryInsertCompany, values);

      // Отправка письма активации
      await new MailService().sendActivationMail(
        req.body.email,
        `${process.env.API_URL}api/company/activate/${activationLink}`
      );

      await client.query(
        `
          INSERT INTO egrpou_info (
            company_id, egrpou, name, name_short, address, director, kved, inn, inn_date, last_update
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          ) RETURNING *;
          `,
        [rows[0].id, ...Object.values(egrpouInfo)]
      );

      await client.query(
        `
          INSERT INTO companies_info (
            company_id, phone, title, photo, description
          ) VALUES (
            $1, $2, $3, $4, $5
          ) RETURNING *;
          `,
        [
          rows[0].id,
          req.body.phone,
          req.body.title,
          photoUrl, // Используем photoUrl
          req.body.description,
        ]
      );

      const token = jwt.sign(rows[0], process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      if (!token) {
        return next(ApiError.BAD_REQUEST("Не вдалося створити токен"));
      }

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
      });

      return ApiResponse.OK(res, rows[0]);
    } catch (error) {
      console.error(error.message); // Используем console.error для ошибок
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  static async loginUniversity(req, res, next) {
    try {
      const { email, password } = req.body;
      const existedCompany = await CompanyController.getCompanyByEmail(email);
      const checkPass = bcrypt.compareSync(password, existedCompany.password);

      if (!existedCompany || !checkPass) {
        return next(ApiError.UNAUTHORIZED("Неправильний email або пароль"));
      }

      if (!existedCompany.activated) {
        return next(ApiError.UNAUTHORIZED("Підтвердіть email"));
      }

      const token = jwt.sign(existedCompany, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      req.user = existedCompany;

      console.log(req.user);

      // Set cookie with the token
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
      });

      // Send a response (optional)
      res.status(200).json({ message: "Успішний вхід" });
    } catch (error) {
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  static async activateUnivesrity(req, res, next) {
    try {
      const { activateLink } = req.params;
      const email = jwt.decode(activateLink, process.env.JWT_SECRET_KEY);

      console.log(email);

      if (!email) {
        return next(ApiError.BAD_REQUEST("Лінка вже неактивна"));
      }

      const company = await CompanyController.getCompanyByEmail(email);

      const token = jwt.sign(company, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      req.user = company;

      console.log(req.user);

      await client.query(
        `UPDATE companies SET activationLink = NULL, activated = TRUE WHERE email = $1`,
        [email]
      );

      // Set cookie with the token
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
      });

      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  //helpers
  static async getUniversityByEmail(email) {
    const { rows } = await client.query(
      `SELECT * FROM universities WHERE email = $1`,
      [email]
    );

    return rows[0];
  }

  static async checkRegistratedAccByEmail(email) {
    const { rowCount: universities } = await client.query(
      `SELECT * FROM universities WHERE email = $1`,
      [email]
    );

    const { rowCount: companies } = await client.query(
      `SELECT * FROM companies WHERE email = $1`,
      [email]
    );

    return universities + companies;
  }
}
