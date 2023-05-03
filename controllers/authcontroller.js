const passport = require("passport");

exports.google_login = (req, res) => {
  passport.authenticate("google", {
    scope: ["email"],
  });
};

exports.logout = (req, res) => {
  res.send("logged out");
};
