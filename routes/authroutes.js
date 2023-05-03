const express = require("express");
const router = express.Router();
const controller = require("../controllers/authcontroller.js");
const passport = require("passport");
const UserDao = require("../dao/userDao");
const dao = new UserDao("./database/users.db");
const bcrypt = require("bcrypt");

//auth routes
//Google auth
//MOVE TO CONTROLLER
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

//NOT WORKING
router.post(
  "/local",
  passport.authenticate("local", {
    successRedirect: "/user",
    failureRedirect: "/",
  }),
  (req, res) => {
    const { user } = req.body;
    res.cookie("user", user);
    res.redirect("/user");
  }
);

//WORKING
router.post("/register", (req, res) => {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.log("error, Could not create user.");
      return res.redirect("/register");
    }
    const user = {
      name: name,
      email: email,
      trackers: new Array(),
      password: hash,
    };
    dao.saveUser(user);
    res.cookie("user", user._id);
    res.redirect("/");
  });
});

// auth logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  // res.send(req.user);
  res.redirect("/user");
});

module.exports = router;
