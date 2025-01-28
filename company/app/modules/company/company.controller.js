import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import * as uuid from "uuid";
import * as bcrypt from "bcrypt";
import CloudinaryService from "../../../../services/cloudnary.service.js";

export class CompanyController {
  static async createCompany(req, res, next) {
    try {
      const queryGetCompanyByParams = `
        SELECT * FROM companies 
        WHERE email = $1 OR title = $2
      `;

      const { rowCount } = await client.query(queryGetCompanyByParams, [
        req.body.email,
        req.body.title,
      ]);

      if (rowCount > 0) {
        return next(
          ApiError.UNAUTHORIZED("Компанія з таким email або назвою вже існує ")
        );
      }

      let photoUrl = null;
      if (req.file) {
        try {
          const result = await CloudinaryService.uploadImage(
            req.file,
            "company",
            "image"
          );

          photoUrl = result.secure_url;
        } catch (uploadError) {
          return next(ApiError.INTERNAL_SERVER_ERROR("Ошибка загрузки фото"));
        }
      } else {
        return next(ApiError.BAD_REQUEST("Файл не найден"));
      }

      const queryInsertCompany = `
        INSERT INTO companies (
          id, email, password, egrpou, title, photo
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING *;
      `;

      const values = [
        uuid.v4(),
        req.body.email,
        bcrypt.hashSync(req.body.password, 5),
        req.body.egrpou,
        req.body.title,
        photoUrl,
      ];

      const { rows } = await client.query(queryInsertCompany, values);

      // Успешный ответ
      return ApiResponse.OK(res, rows[0]);
    } catch (error) {
      console.log(error.message);
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }
}
