import { ApiError } from "../../../utils/httpResponse.js";
import { ApiResponse } from "../../../utils/httpResponse.js";
import { StudentService } from "./student.service.js";

export class StudentController {
  static async register(req, res, next) {
    try {
      const result = await StudentService.register(req.body);
      res
        .status(201)
        .json(new ApiResponse(201, "Student registered successfully", result));
    } catch (error) {
      next(new ApiError(400, error.message));
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await StudentService.login(email, password);
      res.status(200).json(new ApiResponse(200, "Login successful", result));
    } catch (error) {
      next(new ApiError(401, error.message));
    }
  }

  static async getProfile(req, res, next) {
    try {
      const profile = await StudentService.getProfile(req.user.id);
      res
        .status(200)
        .json(new ApiResponse(200, "Profile retrieved successfully", profile));
    } catch (error) {
      next(new ApiError(404, error.message));
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const profile = await StudentService.updateProfile(req.user.id, req.body);
      res
        .status(200)
        .json(new ApiResponse(200, "Profile updated successfully", profile));
    } catch (error) {
      next(new ApiError(400, error.message));
    }
  }

  static async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      const photoUrl = await StudentService.uploadPhoto(req.user.id, req.file);
      res
        .status(200)
        .json(
          new ApiResponse(200, "Photo uploaded successfully", { photoUrl })
        );
    } catch (error) {
      next(new ApiError(400, error.message));
    }
  }

  static async getApplications(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const result = await StudentService.getApplications(req.user.id, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });

      res
        .status(200)
        .json(
          new ApiResponse(200, "Applications retrieved successfully", result)
        );
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  static async applyForVacancy(req, res, next) {
    try {
      const { vacancyId } = req.params;
      const { cover_letter } = req.body;

      const application = await StudentService.applyForVacancy(
        req.user.id,
        vacancyId,
        { cover_letter }
      );

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "Application submitted successfully",
            application
          )
        );
    } catch (error) {
      next(new ApiError(400, error.message));
    }
  }

  static async deleteApplication(req, res, next) {
    try {
      const { applicationId } = req.params;

      const result = await StudentService.deleteApplication(
        req.user.id,
        applicationId
      );

      res
        .status(200)
        .json(new ApiResponse(200, "Application deleted successfully", result));
    } catch (error) {
      next(new ApiError(404, error.message));
    }
  }
}
