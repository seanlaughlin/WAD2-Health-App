exports.landing_page = function (req, res) {
  res.render("home", {
    title: "Greenfields Health - Welcome",
    loggedIn: req.user,
  });
};

exports.about_page = function (req, res) {
  res.render("about", {
    title: "Greenfields Health - About Us",
    loggedIn: req.user,
  });
};

exports.login_page = function (req, res) {
  if (req.user) {
    res.redirect("/user");
  } else {
    res.render("login", {
      title: "Greenfields Health - Log In",
    });
  }
};

exports.register_page = function (req, res) {
  if (req.user) {
    res.redirect("/user");
  } else {
    res.render("register", {
      title: "Greenfields Health - Register",
    });
  }
};
