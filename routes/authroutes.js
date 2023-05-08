const express = require("express");
const router = express.Router();
console.log(__dirname)
const authController = require("/opt/render/project/src/controllers/authController.js");

router.get("/google", authController.googleAuth);
router.post("/local", authController.localAuth);
router.post("/register", authController.registerUser);
router.get("/logout", authController.logout);
router.get("/google/redirect", authController.googleRedirect, (req, res) => {
  res.redirect("/user/");
});

module.exports = router;