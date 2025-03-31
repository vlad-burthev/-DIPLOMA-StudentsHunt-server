import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import { VacancyService } from "./vacancy.service.js";

export class VacancyController {
  static async getAllVacancies(req, res, next) {
    try {
      const { limit, title } = req.params;

      const getAllVacanciesQuery = `
        SELECT * FROM vacancies
        `;

      const { rows, rowCount } = await client.query(getAllVacanciesQuery);

      return ApiResponse.OK(res, { data: rows, count: rowCount });
    } catch (error) {
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }

  async createVacancy(req, res, next) {
    try {
      const vacancy = await VacancyService.createVacancy(
        req.user.id,
        req.user.recruiter_id,
        req.body
      );
      return res
        .status(201)
        .json(new ApiResponse(201, "Vacancy created successfully", vacancy));
    } catch (error) {
      next(error);
    }
  }

  async getVacancyById(req, res, next) {
    try {
      const vacancy = await VacancyService.getVacancyById(req.params.id);
      if (!vacancy) {
        throw new ApiError(404, "Vacancy not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Vacancy retrieved successfully", vacancy));
    } catch (error) {
      next(error);
    }
  }

  async updateVacancy(req, res, next) {
    try {
      const vacancy = await VacancyService.updateVacancy(
        req.params.id,
        req.body
      );
      if (!vacancy) {
        throw new ApiError(404, "Vacancy not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Vacancy updated successfully", vacancy));
    } catch (error) {
      next(error);
    }
  }

  async deleteVacancy(req, res, next) {
    try {
      const vacancy = await VacancyService.deleteVacancy(req.params.id);
      if (!vacancy) {
        throw new ApiError(404, "Vacancy not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Vacancy deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getCompanyVacancies(req, res, next) {
    try {
      const { vacancies, pagination } =
        await VacancyService.getCompanyVacancies(req.user.id, req.query);
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

  async getRecruiterVacancies(req, res, next) {
    try {
      const { vacancies, pagination } =
        await VacancyService.getRecruiterVacancies(
          req.user.recruiter_id,
          req.query
        );
      return res.status(200).json(
        new ApiResponse(200, "Recruiter vacancies retrieved successfully", {
          vacancies,
          pagination,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async updateVacancyStatus(req, res, next) {
    try {
      const vacancy = await VacancyService.updateVacancyStatus(
        req.params.id,
        req.body.isActive
      );
      if (!vacancy) {
        throw new ApiError(404, "Vacancy not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Vacancy status updated successfully", vacancy)
        );
    } catch (error) {
      next(error);
    }
  }

  async getVacancyStatistics(req, res, next) {
    try {
      const statistics = await VacancyService.getVacancyStatistics(
        req.params.id
      );
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Vacancy statistics retrieved successfully",
            statistics
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
