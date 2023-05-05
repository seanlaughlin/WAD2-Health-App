const express = require("express");
const router = express.Router();
const TrackerDao = require("../dao/trackerDao");
const trackerDao = new TrackerDao("./database/trackers.db");

const authCheck = (req, res, next) => {
  //if user isn't logged in redirect to login
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

//renders dashboard
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
  //Redirect to dashboard if no metric specified
  if (!requestedMetric || !tracker)
    res.redirect('/user/')
  else {
    console.log("tracker: " + tracker)
    const type = tracker.type;
    try {
      const entries = tracker.entries;
      //sort by date oldest to most recent
      entries.sort((d1, d2) => d1.date - d2.date);
      const dates = tracker.entries.map(entry => entry.date);
      //Convert into strings as currently in msec

      //Get values to be rendered by mustache from tracker obj
      const data = tracker.entries.map(entry => entry.value);
      const minimumValue = Math.min(...data);
      const units = tracker.units;
      metric = tracker.metric;
      const goals = tracker.goals;

      //Convert dates to more readable date format than mustache provides
      goals.forEach(element => {
        element.date = new Date(element.date).toLocaleDateString();
        element.achievedDate = new Date(element.achievedDate).toLocaleDateString();
      });
      entries.forEach(element => {
        element.date = new Date(element.date).toLocaleDateString();
      });

      const lastSubmission = data[data.length - 1];
      //Get sum of all submissions & percentage complete (used for progress bar style tracker)
      const totalSubmissionValue = data.length != 0 ? (data.reduce(function (a, b) {
        return a + b;
      })) : 0
      const percentageComplete = goals.length != 0 ? (Math.trunc(((totalSubmissionValue / goals[goals.length - 1].value) * 100))) : 0
      console.log("total val " + (Math.trunc(((totalSubmissionValue / goals[goals.length - 1].value) * 100))));

      const goalAchieved = percentageComplete >= 100 ? true : false;

      //If greater than 100% complete, set to 100% for progress bar width
      percentageComplete > 100 ? 100 : percentageComplete;

      res.render(`user/tracker/${type}tracker`, {
        title: `Greenfields Health - ${metric} Tracker`,
        loggedIn: true,
        labels: JSON.stringify(dates),
        data: JSON.stringify(data),
        suggestedMin: minimumValue,
        units: units,
        metric: metric,
        goals: goals.filter(g => !g.isAchieved),
        goalsAchieved: goals.filter(g => g.isAchieved),
        totalSubmissionValues: totalSubmissionValue,
        percentageComplete: percentageComplete,
        goalAchieved: goalAchieved,
        lastSubmission: lastSubmission,
        entries: entries,
      });
    } catch (err) {
      try {
        const goals = tracker.goals;
        const units = tracker.units;
        console.log('No submission data.')
        console.log(err)
        res.render(`user/tracker/${type}tracker`, {
          title: `Greenfields Health - ${metric} Tracker`,
          loggedIn: true,
          goals: goals.filter(g => !g.isAchieved),
          units: units,
          metric: metric
        });
      }
      catch (err) {
        console.log('No data.')
        console.log(err);
        res.render(`user/tracker/${type}tracker`, {
          title: `Greenfields Health - ${metric} Tracker`,
          loggedIn: true,
          metric: metric
        })
      }
    }
  }
});

//For a user to submit a new metric reading, and create tracker if doesn't exist
router.post('/metric/submit', authCheck, async (req, res) => {
  trackerDao.setUserId(req.user._id);
  const value = parseInt(req.body.value);
  const metric = req.body.metric;
  const date = req.body.date;

  trackerDao.findTrackerByMetric(metric).then((tracker) => {
    if (tracker) {
      tracker.entries.push({
        date: date,
        value: value
      });
      trackerDao.updateTracker(tracker);
    }
    //Change this to redirect to error page or dash with error message
    else {
      res.redirect('/user/')
    }
  }).then(res.redirect(req.headers.referer));
});

router.post('/goal/submit', authCheck, async (req, res) => {
  trackerDao.setUserId(req.user._id);
  const value = parseInt(req.body.value);
  const metric = req.body.metric;
  const date = new Date(req.body.date);

  trackerDao.findTrackerByMetric(metric).then((tracker) => {
    if (tracker) {
      tracker.goals.push({
        date: date,
        value: value,
        isAchieved: false,
        achievedDate: null
      });
      trackerDao.updateTracker(tracker);
      trackerDao.findTrackerByMetric(metric).then((tracker) => {
      })
    }
    //Change this to redirect to error page or dash with error message
    else {
      res.redirect('/user/');
    }
  })
  res.redirect(req.headers.referer);
});

//looks for the goal where 'isComplete' is false and updates. There should only be one per tracker at any time uncompleted
router.post('/goal/update', authCheck, async (req, res) => {
  trackerDao.setUserId(req.user._id);

  //get goal properties from request
  const metric = req.body.metric;
  const isAchieved = req.body.isAchieved;
  const achievedDate = req.body.achievedDate;

  //find tracker matching user id and metric
  trackerDao.findTrackerByMetric(metric).then((tracker) => {
    if (tracker) {
      const index = tracker.goals.findIndex(e => !e.isAchieved);
      tracker.goals[index] = {
        date: tracker.goals[index].date,
        value: tracker.goals[index].value,
        isAchieved: isAchieved,
        achievedDate: achievedDate
      }

      //if it's a progress based tracker, clear entries to allow new goals from 0.
      if (tracker.type === "progress") { tracker.entries = [] }
      trackerDao.updateTracker(tracker)
        .then(() => {
          res.status(200).send('Goal updated.');
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send('Error updating goal.');
        });
    }
    else {
      console.log("problem wae dao");
      res.status(404).send('Tracker not found.');
    }
  });
});

//Delete a goal (found by metric and date)
router.post('/goal/delete', authCheck, async (req, res) => {
  const metric = req.body.metric;

  try {
    const numUpdated = await trackerDao.deleteGoalFromTracker(metric);
    if (numUpdated > 0) {
      res.status(200).json({ message: 'Goal deleted' });
    } else {
      res.status(404).json({ message: 'Goal not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting goal' });
  }
});

module.exports = router;
