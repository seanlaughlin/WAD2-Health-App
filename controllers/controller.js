exports.landing_page = function (req, res) {
  res.render("home", {
    title: "Greenfields Health - Welcome",
  });
};
