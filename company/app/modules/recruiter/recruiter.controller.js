import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RecruiterService } from "./recruiter.service.js";

const QUERIES = {
  FIND_EXISTING_VACANCY: `
    SELECT id FROM vacancies
    WHERE company_id = $1 AND title = $2
  `,
  CREATE_VACANCY: `
    INSERT INTO vacancies (
      company_id, recruiter_id, title, description, requirements, 
      salary_from, salary_to, currency, location, work_type
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,
};

export class RecruiterController {
  /**
   * Аутентификация рекрутера.
   */
  static async loginRecruiter(req, res, next) {
    try {
      const { email, password } = req.body;
      const existedRecruiter = await RecruiterController.getRecruiterByEmail(
        email
      );

      if (!existedRecruiter) {
        return next(ApiError.UNAUTHORIZED("Неправильный email или пароль"));
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existedRecruiter.password
      );
      if (!isPasswordValid) {
        return next(ApiError.UNAUTHORIZED("Неправильный email или пароль"));
      }

      // Генерация токена с минимальными данными
      const tokenPayload = {
        id: existedRecruiter.id,
        email: existedRecruiter.email,
        company_id: existedRecruiter.company_id,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      console.log(token);

      req.user = existedRecruiter;

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
      });

      return ApiResponse.OK(res, { message: "Успешный вход" });
    } catch (error) {
      console.error("Ошибка при логине рекрутера:", error.message);
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  /**
   * Создание вакансии рекрутером.
   */
  static async createVacancy(req, res, next) {
    try {
      // Валидация входящих данных
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Извлечение данных из запроса
      const { company_id, id: recruiterId } = req.user;
      const {
        title,
        description,
        requirements,
        salary_from,
        salary_to,
        currency,
        location,
        work_type,
      } = req.body;

      // Проверка существования вакансии с таким же заголовком для данной компании
      const { rows: existingVacancies } = await client.query(
        QUERIES.FIND_EXISTING_VACANCY,
        [company_id, title]
      );

      if (existingVacancies.length > 0) {
        return next(
          ApiError.CONFLICT("Вакансия с таким названием уже существует")
        );
      }

      // Логирование параметров (при необходимости)
      console.log({
        company_id,
        recruiterId,
        title,
        description,
        requirements,
        salary_from,
        salary_to,
        currency,
        location,
        work_type,
      });

      // Создание вакансии
      const { rows } = await client.query(QUERIES.CREATE_VACANCY, [
        company_id,
        recruiterId,
        title,
        description,
        requirements,
        salary_from,
        salary_to,
        currency,
        location,
        work_type,
      ]);

      const createdVacancy = rows[0];
      if (!createdVacancy) {
        return next(ApiError.BAD_REQUEST("Не удалось создать вакансию"));
      }

      return ApiResponse.CREATED(res, createdVacancy);
    } catch (error) {
      console.error("Ошибка при создании вакансии:", error.message);
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  /**
   * Получение всех рекрутеров 1 компании
   */
  static async getAllCompanyRecruiters(req, res, next) {
    try {
      const { id } = req.user;
      const getAllRecruitersFromCompanyQuery = `
        SELECT id, email, name, surname, photo, created_at as date FROM recruiters WHERE company_id = $1;
      `;

      const { rows } = await client.query(getAllRecruitersFromCompanyQuery, [
        id,
      ]);

      return ApiResponse.OK(res, rows);
    } catch (error) {
      console.error(
        "Ошибка при получении всех рекрутёров конкретной компании:",
        error.message
      );
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  /**
   * Удаление рекрутера
   */

  static async deleteRecruiter(req, res, next) {
    try {
      const { id } = req.user;
      const { id: recruiterId } = req.body;
      const deleteRecruiterQuery = `
        DELETE FROM recruiters WHERE id = $1 AND company_id = $2;
      `;

      const { rowCount } = await client.query(deleteRecruiterQuery, [
        recruiterId,
        id,
      ]);

      if (rowCount === 0) {
        return next(ApiError.NOT_FOUND("Рекрутер не найден"));
      }

      return ApiResponse.OK(res, "рекрутера выдалено");
    } catch (error) {
      console.error(
        "Ошибка при удалении рекрутера конкретной компании:",
        error.message
      );
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  /**
   * Получение рекрутера по email.
   */
  static async getRecruiterByEmail(email) {
    const { rows } = await client.query(
      `SELECT * FROM recruiters WHERE email = $1`,
      [email]
    );
    if (!rows[0]) {
      throw ApiError.BAD_REQUEST("Рекрутер не найден");
    }
    return rows[0];
  }

  async createRecruiter(req, res, next) {
    try {
      const recruiter = await RecruiterService.createRecruiter(
        req.user.id,
        req.body
      );
      return res
        .status(201)
        .json(
          new ApiResponse(201, "Recruiter created successfully", recruiter)
        );
    } catch (error) {
      next(error);
    }
  }

  async getRecruiterById(req, res, next) {
    try {
      const recruiter = await RecruiterService.getRecruiterById(req.params.id);
      if (!recruiter) {
        throw new ApiError(404, "Recruiter not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Recruiter retrieved successfully", recruiter)
        );
    } catch (error) {
      next(error);
    }
  }

  async updateRecruiter(req, res, next) {
    try {
      const recruiter = await RecruiterService.updateRecruiter(
        req.params.id,
        req.body
      );
      if (!recruiter) {
        throw new ApiError(404, "Recruiter not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Recruiter updated successfully", recruiter)
        );
    } catch (error) {
      next(error);
    }
  }

  async deleteRecruiter(req, res, next) {
    try {
      const recruiter = await RecruiterService.deleteRecruiter(req.params.id);
      if (!recruiter) {
        throw new ApiError(404, "Recruiter not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Recruiter deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getCompanyRecruiters(req, res, next) {
    try {
      const { recruiters, pagination } =
        await RecruiterService.getCompanyRecruiters(req.user.id, req.query);
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

  async acceptInvitation(req, res, next) {
    try {
      const { token } = req.params;
      const recruiter = await RecruiterService.acceptInvitation(token);
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Invitation accepted successfully", recruiter)
        );
    } catch (error) {
      next(error);
    }
  }
}
