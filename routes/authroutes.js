const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller.js");

router.get("/google", authController.googleAuth);
router.post("/local", authController.localAuth);
router.post("/register", authController.registerUser);
router.get("/logout", authController.logout);
router.get("/google/redirect", authController.googleRedirect, (req, res) => {
  res.redirect("/user/");
});

module.exports = router;