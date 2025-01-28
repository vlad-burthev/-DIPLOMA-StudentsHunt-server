import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";

export class CompanyController {
  static async createCompany(req, res, next) {
    try {
      const queryGetCompanyByParams = `
        SELECT * FROM companies 
        WHERE email = $1 OR title = $2
        `;

      console.log(req.body);
      const { rowCount } = await client.query(queryGetCompanyByParams, [
        req.body.email,
        req.body.title,
      ]);
      if (rowCount > 0) {
        return next(
          ApiError.UNAUTHORIZED("Компанія з таким email або назвою вже існує ")
        );
      }

      return ApiResponse.CREATED(res, "created");
    } catch (error) {
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }
}
