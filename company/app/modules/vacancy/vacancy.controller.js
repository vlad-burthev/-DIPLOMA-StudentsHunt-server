import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";

export class VacaancyController {
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
}
