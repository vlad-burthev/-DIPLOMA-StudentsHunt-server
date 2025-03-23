import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";

export class StudentController {
  static async createSudent(req, res, next) {
    try {
    } catch (error) {
      return next(ApiError.INTERNAL_SERVER_ERROR(error.message));
    }
  }
}
