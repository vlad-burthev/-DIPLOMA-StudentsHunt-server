import passport from "passport";
import { AdminModel } from "./admin.entity.js";
import { ApiError, ApiResponse } from "../../httpResponse/httpResponse.js";
import { configDotenv } from "dotenv";

configDotenv();

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
          return res
            .status(403)
            .redirect(process.env.CLIENT_URL + "/auth/sign-in");
        }

        req.login(user, (err) => {
          if (err) {
            return next(
              ApiError.badRequest("Login failed", 500, "LOGIN_FAILED")
            );
          }
          res.redirect(process.env.CLIENT_URL);
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
