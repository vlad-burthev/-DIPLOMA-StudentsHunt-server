import { SuperAdminService } from "./super-admin.service.js";
import { ApiError } from "../../../utils/httpResponse.js";
import { ApiResponse } from "../../../utils/httpResponse.js";

export class SuperAdminController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await SuperAdminService.login(email, password);
      return ApiResponse.success(res, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

  static async createAdmin(req, res, next) {
    try {
      const admin = await SuperAdminService.createAdmin(req.body);
      return ApiResponse.success(res, "Admin created successfully", admin, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAdmins(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const result = await SuperAdminService.getAdmins({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
      });
      return ApiResponse.success(res, "Admins retrieved successfully", result);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const admin = await SuperAdminService.updateAdminStatus(id, status);
      return ApiResponse.success(
        res,
        "Admin status updated successfully",
        admin
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const admin = await SuperAdminService.deleteAdmin(id);
      return ApiResponse.success(res, "Admin deleted successfully", admin);
    } catch (error) {
      next(error);
    }
  }

  static async getSystemStatistics(req, res, next) {
    try {
      const statistics = await SuperAdminService.getSystemStatistics();
      return ApiResponse.success(
        res,
        "System statistics retrieved successfully",
        statistics
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSystemLogs(req, res, next) {
    try {
      const { page = 1, limit = 10, type, startDate, endDate } = req.query;
      const result = await SuperAdminService.getSystemLogs({
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        startDate,
        endDate,
      });
      return ApiResponse.success(
        res,
        "System logs retrieved successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getSystemSettings(req, res, next) {
    try {
      const settings = await SuperAdminService.getSystemSettings();
      return ApiResponse.success(
        res,
        "System settings retrieved successfully",
        settings
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateSystemSettings(req, res, next) {
    try {
      const settings = await SuperAdminService.updateSystemSettings(req.body);
      return ApiResponse.success(
        res,
        "System settings updated successfully",
        settings
      );
    } catch (error) {
      next(error);
    }
  }
}
