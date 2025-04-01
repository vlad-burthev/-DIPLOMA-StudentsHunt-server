import passport from "passport";
import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";
import { AdminService } from "./admin.service.js";

export const authenticate = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

export const authenticateCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/" },
    async (err, user) => {
      if (err || !user) {
        return res.redirect("/");
      }
      try {
        const query = "SELECT * FROM admins WHERE email = $1";
        const {
          rows: [admin],
        } = await client.query(query, [user._json.email]);

        if (!admin) {
          return next(ApiError.BAD_REQUEST("Admin not found"));
        }

        req.login(user, (err) => {
          if (err) {
            return next(
              ApiError.BAD_REQUEST("Login failed", 500, "LOGIN_FAILED")
            );
          }

          const response = ApiResponse.OK("LOGIN_SUCCESS", {
            message: `Welcome ${user.displayName}`,
          });
          res.locals.apiResponse = response;
          next();
        });
      } catch (error) {
        console.log(error);
        next(ApiError.INTERNAL_SERVER_ERROR(error.message));
      }
    }
  )(req, res, next);
};

export const logout = (req, res, next) => {
  req.logout(() => {
    res.redirect("/");
  });
};

export class AdminController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AdminService.login(email, password);
      res.status(200).json(
        new ApiResponse(200, "Login successful", {
          token: result.token,
          admin: result.admin,
        })
      );
    } catch (error) {
      next(new ApiError(401, error.message));
    }
  }

  static async getCompanies(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;

      const result = await AdminService.getCompanies({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
      });

      res
        .status(200)
        .json(new ApiResponse(200, "Companies retrieved successfully", result));
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  static async getStudents(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;

      const result = await AdminService.getStudents({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
      });

      res
        .status(200)
        .json(new ApiResponse(200, "Students retrieved successfully", result));
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  static async updateCompanyStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "inactive"].includes(status)) {
        throw new Error("Invalid status. Must be 'active' or 'inactive'");
      }

      const result = await AdminService.updateCompanyStatus(
        id,
        status === "active"
      );
      res
        .status(200)
        .json(
          new ApiResponse(200, "Company status updated successfully", result)
        );
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  static async updateStudentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "inactive"].includes(status)) {
        throw new Error("Invalid status. Must be 'active' or 'inactive'");
      }

      const result = await AdminService.updateStudentStatus(
        id,
        status === "active"
      );
      res
        .status(200)
        .json(
          new ApiResponse(200, "Student status updated successfully", result)
        );
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }

  static async getSystemStatistics(req, res, next) {
    try {
      const statistics = await AdminService.getSystemStatistics();
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "System statistics retrieved successfully",
            statistics
          )
        );
    } catch (error) {
      next(new ApiError(500, error.message));
    }
  }
}
