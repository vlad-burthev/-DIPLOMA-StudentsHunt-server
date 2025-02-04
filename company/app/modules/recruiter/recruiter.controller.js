import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
  static async loginRecruiter(req, res, next) {
    try {
      const { email, password } = req.body;
      const existedRecruiter = await RecruiterController.getRecruiterByEmail(
        email
      );
      const checkPass = bcrypt.compareSync(password, existedRecruiter.password);

      if (!existedRecruiter || !checkPass) {
        return next(ApiError.UNAUTHORIZED("Неправильний email або пароль"));
      }

      const token = jwt.sign(existedRecruiter, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      console.log(token);

      req.user = existedRecruiter;

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "strict",
      });

      return ApiResponse.OK(res, { message: "Успішний вхід" });
    } catch (error) {
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  static async createVacancy(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

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

      const { rows: existingVacancies } = await client.query(
        QUERIES.FIND_EXISTING_VACANCY,
        [company_id, title]
      );

      if (existingVacancies.length > 0) {
        return next(
          ApiError.CONFLICT("Vacancy with this title already exists")
        );
      }

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

      const {
        rows: [createdVacancy],
      } = await client.query(QUERIES.CREATE_VACANCY, [
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

      if (!createdVacancy) {
        return next(ApiError.BAD_REQUEST("Failed to create vacancy"));
      }

      return ApiResponse.CREATED(res, createdVacancy);
    } catch (error) {
      return next(ApiError.INTERNAL_SERVER_ERROR("Failed to create vacancy"));
    }
  }

  static async getRecruiterByEmail(email) {
    const { rows } = await client.query(
      `SELECT * FROM recruiters WHERE email = $1`,
      [email]
    );

    if (!rows[0]) {
      throw ApiError.BAD_REQUEST("Компанія не знайдена");
    }

    return rows[0];
  }
}
