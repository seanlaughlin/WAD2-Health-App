exports.landing_page = function (req, res) {
  res.render("home", {
    title: "Greenfields Health - Welcome",
  });
};

exports.login_page = function (req, res) {
  res.render("login", {
    title: "Greenfields Health - Log In",
  });
};

exports.register_page = function (req, res) {
  res.render("register", {
    title: "Greenfields Health - Register",
  });
};
