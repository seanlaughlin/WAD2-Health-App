const express = require("express");
const router = express.Router();
const TrackerDao = require("../dao/trackerDao");
const trackerDao = new TrackerDao("./database/trackers.db");

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
  trackerDao.setUserId(req.user._id);
  trackerDao.findTrackerByMetric("Weight").then((tracker) => {
    try {
      const dates = tracker.entries.map(entry => entry.date);
      //Convert into strings as currently in msec
      const dateStrings = dates.map(date => new Date(date).toLocaleDateString());
      const weights = tracker.entries.map(entry => entry.value);
      const minimumWeight = Math.min(...weights);
      res.render('user/weight', {
        title: 'Greenfields Health - Weight Tracker',
        loggedIn: true,
        labels: JSON.stringify(dateStrings),
        data: JSON.stringify(weights),
        suggestedMin: minimumWeight,
        label: '"Weight"'
      });
    } catch (err) {
      console.log('Error: No data.')
      res.render('user/weight', {
        title: 'Greenfields Health - Weight Tracker',
        loggedIn: true
      });
    }
  });
});

router.post('/metric/submit', async (req, res) => {
  trackerDao.setUserId(req.user._id);
  const value = parseInt(req.body.value);
  const metric = req.body.metric;
  const date = new Date(req.body.date);

  trackerDao.findTrackerByMetric(metric).then((tracker) => {
    if (tracker) {
      tracker.entries.push({
        date: date,
        value: value
      });
      trackerDao.updateTracker(tracker);
      console.log('update')
    }
    else{
      tracker = {
        userId: req.user._id,
        entries: new Array(),
        metric: metric
      }
      tracker.entries.push({
        value: value,
        date: date.getTime(),
      }),
      console.log(date)
      trackerDao.saveTracker(tracker);
      console.log('save')
    }
  })
  res.redirect(req.headers.referer);
});

module.exports = router;
