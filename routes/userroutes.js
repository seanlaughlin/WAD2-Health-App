const express = require("express");
const router = express.Router();
const TrackerDao = require("../dao/trackerDao");

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

router.get("/weight", authCheck, (req, res) => {
  const trackerDao = new TrackerDao("./database/trackers.db", req.user._id);
  trackerDao.findAll().then((tracker) => {
    try {
      res.send(tracker);
    } catch (err) {
      res.send("error obv");
    }
  });
});

module.exports = router;
