const express = require("express");
const router = express.Router();
const path = require("path");
const publicController = require("../controllers/publicController.js");

//public routes
router.get("/", publicController.landing_page);
router.get("/about", publicController.about_page);
router.get("/login", publicController.login_page);
router.get("/register", publicController.register_page);

router.use((req, res) => {
  res.status(404);
  res.render("404", {title: "Greenfields Health - Page Not Found", loggedIn: req.user ? true : false});
});

router.use((err, req, res, next) => {
  res.status(500);
  res.render("500", {title: "Greenfields Health - Internal Server Error", loggedIn: req.user ? true : false});
});
module.exports = router;
