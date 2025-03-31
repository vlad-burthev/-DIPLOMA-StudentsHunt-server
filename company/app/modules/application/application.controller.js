import { ApiResponse, ApiError } from "../../utils/httpResponse.js";
import { ApplicationService } from "./application.service.js";

export class ApplicationController {
  async createApplication(req, res, next) {
    try {
      const application = await ApplicationService.createApplication(
        req.user.id,
        req.params.vacancyId,
        req.body
      );
      return res
        .status(201)
        .json(
          new ApiResponse(201, "Application created successfully", application)
        );
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req, res, next) {
    try {
      const application = await ApplicationService.getApplicationById(
        req.params.id
      );
      if (!application) {
        throw new ApiError(404, "Application not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Application retrieved successfully",
            application
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async updateApplicationStatus(req, res, next) {
    try {
      const application = await ApplicationService.updateApplicationStatus(
        req.params.id,
        req.body.status
      );
      if (!application) {
        throw new ApiError(404, "Application not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Application status updated successfully",
            application
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async deleteApplication(req, res, next) {
    try {
      const application = await ApplicationService.deleteApplication(
        req.params.id
      );
      if (!application) {
        throw new ApiError(404, "Application not found");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Application deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getVacancyApplications(req, res, next) {
    try {
      const { applications, pagination } =
        await ApplicationService.getVacancyApplications(
          req.params.vacancyId,
          req.query
        );
      return res.status(200).json(
        new ApiResponse(200, "Vacancy applications retrieved successfully", {
          applications,
          pagination,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async getStudentApplications(req, res, next) {
    try {
      const { applications, pagination } =
        await ApplicationService.getStudentApplications(req.user.id, req.query);
      return res.status(200).json(
        new ApiResponse(200, "Student applications retrieved successfully", {
          applications,
          pagination,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}
