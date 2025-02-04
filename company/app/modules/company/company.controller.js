import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import bcrypt from "bcrypt";
import CloudinaryService from "../../../../services/cloudnary.service.js";
import { checkEGRPOUCode } from "../../../../services/egrpou.service.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { MailService } from "../../../../services/mail.service.js";
import { validationResult } from "express-validator";

configDotenv();

export class CompanyController {
  /**
   * Создание компании с использованием транзакции
   */
  static async createCompany(req, res, next) {
    try {
      // Проверка валидности запроса
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Проверка существования компании по email, title или EGRPOU
      const queryGetCompanyByTitle = `
        SELECT * FROM companies_info
        WHERE title = $1
      `;
      const queryGetCompanyByEgrpou = `
        SELECT * FROM egrpou_info
        WHERE egrpou = $1
      `;
      const { accounts } = await CompanyController.checkRegistratedAccByEmail(
        req.body.email
      );

      const { rows: rowsByTitle } = await client.query(queryGetCompanyByTitle, [
        req.body.title,
      ]);
      const { rows: rowsByEgrpou } = await client.query(
        queryGetCompanyByEgrpou,
        [req.body.egrpou]
      );

      if (accounts > 0 || rowsByTitle.length > 0 || rowsByEgrpou.length > 0) {
        return next(
          ApiError.UNAUTHORIZED(
            "Компания с таким email или названием уже существует"
          )
        );
      }

      // Проверка корректности EGRPOU
      const egrpouInfo = await checkEGRPOUCode(req.body.egrpou);
      if (egrpouInfo instanceof Error) {
        return next(ApiError.BAD_REQUEST(egrpouInfo.message));
      }

      // Проверка наличия файла фото
      if (!req.file) {
        return next(ApiError.BAD_REQUEST("Файл не найден"));
      }

      // Загрузка изображения в Cloudinary
      let photoUrl = null;
      try {
        const result = await CloudinaryService.uploadImage(
          req.file,
          "company",
          "image"
        );
        photoUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Ошибка загрузки изображения:", uploadError);
        return next(ApiError.INTERNAL_SERVER_ERROR("Ошибка загрузки фото"));
      }

      // Начало транзакции
      await client.query("BEGIN");

      // Генерация активационной ссылки (используем подписанный токен)
      const activationLink = jwt.sign(
        { email: req.body.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );

      // Хеширование пароля (асинхронно)
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      // Вставка основной информации о компании
      const queryInsertCompany = `
        INSERT INTO companies (email, password, activationLink)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const { rows } = await client.query(queryInsertCompany, [
        req.body.email,
        hashedPassword,
        activationLink,
      ]);
      const newCompany = rows[0];

      // Отправка письма активации
      const activationUrl = `${process.env.API_URL}api/company/activate/${activationLink}`;
      await new MailService().sendActivationMail(req.body.email, activationUrl);

      // Вставка данных EGRPOU
      const egrpouValues = [
        newCompany.id,
        req.body.egrpou,
        egrpouInfo.name,
        egrpouInfo.name_short,
        egrpouInfo.address,
        egrpouInfo.director,
        egrpouInfo.kved,
        egrpouInfo.inn,
        egrpouInfo.inn_date,
        egrpouInfo.last_update,
      ];
      await client.query(
        `
        INSERT INTO egrpou_info (
          company_id, egrpou, name, name_short, address, director, kved, inn, inn_date, last_update
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        );
        `,
        egrpouValues
      );

      // Вставка дополнительной информации о компании
      await client.query(
        `
        INSERT INTO companies_info (company_id, phone, title, photo, description)
        VALUES ($1, $2, $3, $4, $5);
        `,
        [
          newCompany.id,
          req.body.phone,
          req.body.title,
          photoUrl,
          req.body.description,
        ]
      );

      // Фиксируем транзакцию
      await client.query("COMMIT");

      // Генерация токена для сессии
      const token = jwt.sign(
        {
          id: newCompany.id,
          email: newCompany.email,
          role_id: newCompany.role_id,
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

      return ApiResponse.OK(res, newCompany);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Ошибка создания компании:", error.message);
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  /*
   * Логин компании
   */
  static async loginCompany(req, res, next) {
    try {
      const { email, password } = req.body;
      const existedCompany = await CompanyController.getCompanyByEmail(email);

      if (!existedCompany) {
        return next(ApiError.UNAUTHORIZED("Неправильный email или пароль"));
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existedCompany.password
      );
      if (!isPasswordValid) {
        return next(ApiError.UNAUTHORIZED("Неправильный email или пароль"));
      }

      if (!existedCompany.activated) {
        return next(ApiError.UNAUTHORIZED("Подтвердите email"));
      }

      const token = jwt.sign(
        {
          id: existedCompany.id,
          email: existedCompany.email,
          role_id: existedCompany.role_id,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );

      req.user = existedCompany;

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
      });

      console.log(token);

      return res.status(200).json({ message: "Успешный вход" });
    } catch (error) {
      console.error("Ошибка логина:", error.message);
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  /**
   * Создание рекрутера для компании
   */
  static async createRecruiter(req, res, next) {
    try {
      const { email, password, name, surname } = req.body;
      const recruiterPhotoFile = req.file;

      // Проверка существования рекрутера по email
      const findRecruiterQuery = `SELECT * FROM recruiters WHERE email = $1`;
      const { rows: recruiterRows } = await client.query(findRecruiterQuery, [
        email,
      ]);
      if (recruiterRows.length > 0) {
        return next(
          ApiError.BAD_REQUEST("Рекрутер с таким email уже существует")
        );
      }

      // Если требуется загрузка фото для рекрутера, можно также загрузить через Cloudinary
      let recruiterPhoto = null;
      if (recruiterPhotoFile) {
        try {
          const result = await CloudinaryService.uploadImage(
            recruiterPhotoFile,
            "recruiter",
            "image"
          );
          recruiterPhoto = result.secure_url;
        } catch (uploadError) {
          console.error("Ошибка загрузки фото рекрутера:", uploadError);
          return next(ApiError.INTERNAL_SERVER_ERROR("Ошибка загрузки фото"));
        }
      }

      // Асинхронное хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      const createRecruiterQuery = `
        INSERT INTO recruiters (
          company_id, email, password, name, surname, photo
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING *;
      `;
      const values = [
        req.user.id, // id компании из авторизации
        email,
        hashedPassword,
        name,
        surname,
        recruiterPhoto,
      ];
      const { rows } = await client.query(createRecruiterQuery, values);

      return ApiResponse.CREATED(res, rows[0]);
    } catch (error) {
      console.error("Ошибка создания рекрутера:", error.message);
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  /**
   * Активация компании по активационной ссылке
   */
  static async activateCompany(req, res, next) {
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

      const company = await CompanyController.getCompanyByEmail(email);
      if (!company) {
        return next(ApiError.BAD_REQUEST("Компания не найдена"));
      }

      // Обновляем статус активации компании
      await client.query(
        `UPDATE companies SET activationLink = NULL, activated = TRUE WHERE email = $1`,
        [email]
      );

      // Генерируем токен для сессии после активации
      const token = jwt.sign(
        { id: company.id, email: company.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );
      req.user = company;
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
      });

      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      console.error("Ошибка активации компании:", error.message);
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  // Хелперы

  /**
   * Получение компании по email
   */
  static async getCompanyByEmail(email) {
    const { rows } = await client.query(
      `SELECT * FROM companies WHERE email = $1`,
      [email]
    );
    if (!rows[0]) {
      throw ApiError.BAD_REQUEST("Компания не найдена");
    }
    return rows[0];
  }

  /**
   * Проверка зарегистрированных аккаунтов (университеты и компании) по email.
   * Возвращает объект с количеством найденных аккаунтов.
   */
  static async checkRegistratedAccByEmail(email) {
    const { rows: universities } = await client.query(
      `SELECT * FROM universities WHERE email = $1`,
      [email]
    );
    const { rows: companies } = await client.query(
      `SELECT * FROM companies WHERE email = $1`,
      [email]
    );
    return { accounts: universities.length + companies.length };
  }
}
