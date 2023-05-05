const express = require("express");
const router = express.Router();
const TrackerDao = require("../dao/trackerDao");
const trackerDao = new TrackerDao("./database/trackers.db");

const authCheck = (req, res, next) => {
  //if user isn't logged in
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

//directs to dashboard
router.get("/", authCheck, (req, res) => {
  res.render("user/dashboard", {
    title: "Greenfields Health - User Dashboard",
    loggedIn: true,
    name: req.user.name,
  });
});

router.get('/create', authCheck, (req, res) => {
  res.render("user/newtrackerform");
})

// Create a new tracker and return the newly created tracker in JSON format
router.post('/tracker/create', authCheck, async (req, res) => {

  const requestedMetric = req.body.metric;
  const units = req.body.units;
  const category = req.body.category;
  const trackerType = req.body.trackerType;

  const tracker = {
    userId: req.user._id,
    metric: requestedMetric,
    category: category,
    type: trackerType,
    units: units,
    entries: new Array(),
    goals: new Array()
  }

  const createdTracker = await trackerDao.saveTracker(tracker);
  res.json(createdTracker);
});

//gets tracker data and directs user to tracker page
router.get("/tracker", authCheck, async (req, res) => {

  trackerDao.setUserId(req.user._id);
  //Get the tracker requested from url
  const requestedMetric = req.query.metric;
  const tracker = await trackerDao.findTrackerByMetric(requestedMetric);
  const type = tracker.type;
    try {
      const entries = tracker.entries;
      //sort by date oldest to most recent
      entries.sort((d1, d2) => d1.date - d2.date);
      const dates = tracker.entries.map(entry => entry.date);
      //Convert into strings as currently in msec
      const dateStrings = dates.map(date => new Date(date).toLocaleDateString());
      //Get values to be rendered by mustache from tracker obj
      const data = tracker.entries.map(entry => entry.value);
      const minimumValue = Math.min(...data);
      const units = tracker.units;
      metric = tracker.metric;
      const goals = tracker.goals;
      goals.forEach(element => {
        const date = new Date();
        const goalDate = new Date(element.date);
        if (date > goalDate) element.overdue = true;
        element.date = element.date.toDateString();
      });
      const lastSubmission = data[data.length - 1];

      res.render(`user/tracker/${type}tracker`, {
        title: `Greenfields Health - ${metric} Tracker`,
        loggedIn: true,
        labels: JSON.stringify(dateStrings),
        data: JSON.stringify(data),
        suggestedMin: minimumValue,
        units: units,
        metric: metric,
        goals: goals,
        lastSubmission: lastSubmission
      });
    } catch (err) {
      try {
        const goals = tracker.goals;
        const unit = tracker.unit;
        console.log('No submission data.')
        console.log(err)
        res.render(`user/tracker/${type}tracker`, {
          title: `Greenfields Health - ${metric} Tracker`,
          loggedIn: true,
          goals: goals,
          units: units
        });
      }
      catch (err) {
        console.log('No data.')
        console.log(err);
        res.render(`user/tracker/${type}tracker`, {
          title: `Greenfields Health - ${metric} Tracker`,
          loggedIn: true
        })
      }
    }
  });

//For a user to submit a new metric reading, and create tracker if doesn't exist
router.post('/metric/submit', authCheck, async (req, res) => {
  trackerDao.setUserId(req.user._id);
  const value = parseInt(req.body.value);
  const metric = req.body.metric;
  const date = new Date(req.body.date);
  const unit = req.body.units;
  const category = req.body.category;

  trackerDao.findTrackerByMetric(metric).then((tracker) => {
    if (tracker) {
      tracker.entries.push({
        date: date,
        value: value
      });
      trackerDao.updateTracker(tracker);
    }
    else {
      tracker = {
        userId: req.user._id,
        entries: new Array(),
        goals: new Array(),
        metric: metric,
        units: units
      }
      tracker.entries.push({
        value: value,
        date: parseInt(date.getTime()),
      }),
      trackerDao.saveTracker(tracker);
    }
  }).then(res.redirect(req.headers.referer));
});

router.post('/goal/submit', async (req, res) => {
  trackerDao.setUserId(req.user._id);
  const value = parseInt(req.body.value);
  const metric = req.body.metric;
  const date = new Date(req.body.date);
  const units = req.body.units;

  trackerDao.findTrackerByMetric(metric).then((tracker) => {
    if (tracker) {
      tracker.goals.push({
        date: date,
        value: value
      });
      trackerDao.updateTracker(tracker);
      trackerDao.findTrackerByMetric(metric).then((tracker) =>{
      })
    }
    else {
      const goals = new Array();
      goals.push({
        date: date,
        value: value
      })
      tracker = {
        userId: req.user._id,
        entries: new Array(),
        goals: goals,
        metric: metric,
        units: units
      }
      trackerDao.saveTracker(tracker);
    }
  })
  res.redirect(req.headers.referer);
});

module.exports = router;
