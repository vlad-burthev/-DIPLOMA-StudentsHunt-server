import passport from "passport";
import { AdminModel } from "./admin.entity.js";
import { ApiError, ApiResponse } from "../../httpResponse/httpResponse.js";

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
        const admin = await AdminModel.findOne({
          where: { email: user._json.email },
        });
        if (!admin) {
          return next(
            ApiError.badRequest("Admin not found", 404, "ADMIN_NOT_FOUND")
          );
        }

        req.login(user, (err) => {
          if (err) {
            return next(
              ApiError.badRequest("Login failed", 500, "LOGIN_FAILED")
            );
          }

          const response = ApiResponse.OK(200, "LOGIN_SUCCESS", {
            message: `Welcome ${user.displayName}`,
          });
          res.locals.apiResponse = response;
          next();
        });
      } catch (error) {
        next(
          ApiError.InternalServerError(error.message, 500, "INTERNAL_ERROR")
        );
      }
    }
  )(req, res, next);
};

export const logout = (req, res, next) => {
  req.logout(() => {
    res.redirect("/");
  });
};
