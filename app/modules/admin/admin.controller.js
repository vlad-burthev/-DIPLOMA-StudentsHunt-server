import passport from "passport";

export const authenticate = (req, res, next) => {
  console.log("Authenticate route hit");
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

export const authenticateCallback = () => {
  passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.send(`Welcome ${req.user.displayName}`);
    };
};

export const logout = (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
};
