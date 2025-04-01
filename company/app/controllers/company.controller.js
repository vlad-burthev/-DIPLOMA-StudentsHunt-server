const CompanyService = require("../services/company.service");
const ApiResponse = require("../helpers/ApiResponse");

class CompanyController {
  // Recruiter Management
  async createRecruiter(req, res, next) {
    try {
      const companyId = req.user.id; // Assuming user ID is set by auth middleware
      const recruiter = await CompanyService.createRecruiter(
        companyId,
        req.body
      );
      res.json(
        new ApiResponse(true, "Recruiter created successfully", recruiter)
      );
    } catch (error) {
      next(error);
    }
  }

  async updateRecruiter(req, res, next) {
    try {
      const companyId = req.user.id;
      const { recruiterId } = req.params;
      const recruiter = await CompanyService.updateRecruiter(
        companyId,
        recruiterId,
        req.body
      );
      res.json(
        new ApiResponse(true, "Recruiter updated successfully", recruiter)
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteRecruiter(req, res, next) {
    try {
      const companyId = req.user.id;
      const { recruiterId } = req.params;
      const result = await CompanyService.deleteRecruiter(
        companyId,
        recruiterId
      );
      res.json(new ApiResponse(true, result.message));
    } catch (error) {
      next(error);
    }
  }

  // Company Statistics
  async getCompanyStatistics(req, res, next) {
    try {
      const companyId = req.user.id;
      const statistics = await CompanyService.getCompanyStatistics(companyId);
      res.json(
        new ApiResponse(
          true,
          "Company statistics retrieved successfully",
          statistics
        )
      );
    } catch (error) {
      next(error);
    }
  }

  // Company Profile Management
  async updateCompanyProfile(req, res, next) {
    try {
      const companyId = req.user.id;
      const profile = await CompanyService.updateCompanyProfile(
        companyId,
        req.body
      );
      res.json(
        new ApiResponse(true, "Company profile updated successfully", profile)
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteCompanyProfile(req, res, next) {
    try {
      const companyId = req.user.id;
      const result = await CompanyService.deleteCompanyProfile(companyId);
      res.json(new ApiResponse(true, result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();
