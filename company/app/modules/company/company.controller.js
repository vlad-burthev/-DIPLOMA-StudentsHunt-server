import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import bcrypt from "bcrypt";
import CloudinaryService from "../../../../services/cloudnary.service.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { CompanyService } from "./company.service.js";

configDotenv();

export class CompanyController {
  /**
   * Создание компании с использованием транзакции
   */
  async createCompany(req, res, next) {
    try {
      const company = await CompanyService.createCompany(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, "Company created successfully", company));
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const company = await CompanyService.getCompanyById(req.params.id);
      if (!company) {
        throw new ApiError(404, "Company not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Company retrieved successfully", company));
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const company = await CompanyService.updateCompany(
        req.params.id,
        req.body
      );
      if (!company) {
        throw new ApiError(404, "Company not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Company updated successfully", company));
    } catch (error) {
      next(error);
    }
  }

  async deleteCompany(req, res, next) {
    try {
      const company = await CompanyService.deleteCompany(req.params.id);
      if (!company) {
        throw new ApiError(404, "Company not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Company deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getCompanies(req, res, next) {
    try {
      const { companies, pagination } = await CompanyService.getCompanies(
        req.query
      );
      return res.status(200).json(
        new ApiResponse(200, "Companies retrieved successfully", {
          companies,
          pagination,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async getCompanyVacancies(req, res, next) {
    try {
      const { vacancies, pagination } =
        await CompanyService.getCompanyVacancies(req.params.id, req.query);
      return res.status(200).json(
        new ApiResponse(200, "Company vacancies retrieved successfully", {
          vacancies,
          pagination,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async getCompanyRecruiters(req, res, next) {
    try {
      const { recruiters, pagination } =
        await CompanyService.getCompanyRecruiters(req.params.id, req.query);
      return res.status(200).json(
        new ApiResponse(200, "Company recruiters retrieved successfully", {
          recruiters,
          pagination,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async updateCompanyStatus(req, res, next) {
    try {
      const company = await CompanyService.updateCompanyStatus(
        req.params.id,
        req.body.status
      );
      if (!company) {
        throw new ApiError(404, "Company not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Company status updated successfully", company)
        );
    } catch (error) {
      next(error);
    }
  }

  async getCompanyStatistics(req, res, next) {
    try {
      const statistics = await CompanyService.getCompanyStatistics(
        req.params.id
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Company statistics retrieved successfully",
            statistics
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
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
      // await client.query(
      //   `UPDATE companies SET activationLink = NULL, activated = TRUE WHERE email = $1`,
      //   [email]
      // );

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
