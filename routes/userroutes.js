const express = require("express");
const router = express.Router();

const authCheck = (req, res, next) => {
  //it user isn't logged in
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

router.get("/", authCheck, (req, res) => {
  res.render("user/dashboard", {
    title: "Greenfields Health - User Dashboard",
    loggedIn: true,
    name: req.user.name,
  });
});

module.exports = router;
