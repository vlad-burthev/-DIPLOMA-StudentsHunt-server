import client from "../../../../company/db.config";
import { ApiError, ApiResponse } from "../../../../httpResponse/httpResponse";

export class ApplicationService {
  async applicationOnVacancy(req, res, next) {
    try {
      const { company_id, vacancy_id } = req.body;
      const { id: student_id } = req.user;

      const checkQueryParams = `
            SELECT * FROM applications
            WHERE company_id = $1 AND vacancy_id = $2 and student_id = $3
      `;

      const { rows: existApplication } = await client.query(checkQueryParams, [
        company_id,
        vacancy_id,
        student_id,
      ]);

      if (existApplication.length > 0) {
        return next(ApiError.BAD_REQUEST("Ви вже відгукнулись на цю вакансію"));
      }

      // Вставка основной информации о компании
      const queryInsertApplication = `
        INSERT INTO applications (company_id, vacancy_id, student_id)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      await client.query(queryInsertApplication, [
        company_id,
        vacancy_id,
        student_id,
      ]);

      broadcastMessage({
        event: "newApplication",
        data: { student_id },
      });

      return ApiResponse.CREATED(res, "Ви відгукнулись !");
    } catch (error) {
      next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }
}
