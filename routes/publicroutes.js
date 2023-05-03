const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller.js");

//public routes
router.get("/", controller.landing_page);
router.get("/about", controller.about_page);
router.get("/login", controller.login_page);
router.get("/register", controller.register_page);

router.use((req, res) => {
  res.status(404);
  res.type("text/plain");
  res.send("404 Not found.");
});

router.use((err, req, res, next) => {
  res.status(500);
  res.type("text/plain");
  res.send("Internal Server Error.");
});
module.exports = router;
