import passport from "passport";
import {
  ApiError,
  ApiResponse,
} from "../../../../httpResponse/httpResponse.js";
import client from "../../../db.config.js";

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
