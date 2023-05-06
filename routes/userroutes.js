const express = require("express");
const router = express.Router();
const TrackerDao = require("../dao/trackerDao");
const GoalDao = require("../dao/goalDao");

const trackerDao = new TrackerDao("./database/trackers.db");
const goalDao = new GoalDao("./database/goals.db");

const authCheck = (req, res, next) => {
  //if user isn't logged in redirect to login
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

router.get("/", authCheck, async (req, res) => {
  goalDao.setUserId(req.user._id);
  trackerDao.setUserId(req.user._id);

  const goals = await goalDao.findAll();
  const trackers = await trackerDao.findAll();

  const lifestyleTrackers = trackers.filter(t => t.category === "Lifestyle");
  const nutritionDietTrackers = trackers.filter(t => t.category === "Nutrition and Diet");
  const fitnessTrackers = trackers.filter(t => t.category === "Fitness");

  const achievedGoals = goals.filter(g => g.isAchieved);
  const outstandingGoals = goals.filter(g => !g.isAchieved);
  console.log(outstandingGoals)

  // Get goals for each tracker
  const fitnessTrackersWithGoals = await Promise.all(
    fitnessTrackers.map(async (tracker) => {
      const trackerGoals = await goalDao.findByMetric(tracker.metric);
      const achievedTrackerGoals = trackerGoals.filter(goal => goal.isAchieved);
      const outstandingTrackerGoals = trackerGoals.filter(goal => !goal.isAchieved);
      return { tracker, achievedGoals: achievedTrackerGoals, outstandingGoals: outstandingTrackerGoals };
    })
  );

  const nutritionDietTrackersWithGoals = await Promise.all(
    nutritionDietTrackers.map(async (tracker) => {
      const trackerGoals = await goalDao.findByMetric(tracker.metric);
      const achievedTrackerGoals = trackerGoals.filter(goal => goal.isAchieved);
      const outstandingTrackerGoals = trackerGoals.filter(goal => !goal.isAchieved);
      return { tracker, achievedGoals: achievedTrackerGoals, outstandingGoals: outstandingTrackerGoals };
    })
  );

  const lifestyleTrackersWithGoals = await Promise.all(
    lifestyleTrackers.map(async (tracker) => {
      const trackerGoals = await goalDao.findByMetric(tracker.metric);
      const achievedTrackerGoals = trackerGoals.filter(goal => goal.isAchieved);
      const outstandingTrackerGoals = trackerGoals.filter(goal => !goal.isAchieved);
      return { tracker, achievedGoals: achievedTrackerGoals, outstandingGoals: outstandingTrackerGoals };
    })
  );

  res.render("user/dashboard", {
    title: "Greenfields Health - User Dashboard",
    loggedIn: true,
    name: req.user.name,
    goalsAchieved: achievedGoals.length,
    goalsOutstanding: outstandingGoals.length,
    numberTrackers: trackers.length,
    lifestyleTrackers: lifestyleTrackersWithGoals,
    nutritionDietTrackers: nutritionDietTrackersWithGoals,
    fitnessTrackers: fitnessTrackersWithGoals
  });
});

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
    entries: []
  }

  const createdTracker = await trackerDao.saveTracker(tracker);
  res.json(createdTracker);
});

// Get tracker data and direct user to tracker page
router.get("/tracker", authCheck, async (req, res) => {
  trackerDao.setUserId(req.user._id);
  goalDao.setUserId(req.user._id);

  // Get the tracker requested from the URL
  const requestedMetric = req.query.metric;
  const tracker = await trackerDao.findTrackerByMetric(requestedMetric);

  // Redirect to dashboard if no metric specified or tracker not found
  if (!requestedMetric || !tracker) {
    res.redirect('/user/');
    return;
  }

  const type = tracker.type;

  try {
    const entries = tracker.entries;

    // Sort entries by date, oldest to most recent
    entries.sort((d1, d2) => d1.date - d2.date);

    // Convert entry dates to more readable format
    entries.forEach(element => {
      element.date = new Date(element.date).toLocaleDateString();
    });

    const dates = entries.map(entry => entry.date);

    // Get values to be rendered by Mustache from tracker object
    const data = entries.map(entry => entry.value);
    const minimumValue = Math.min(...data);
    const units = tracker.units;
    const metric = tracker.metric;
    const goals = await goalDao.findByMetric(metric);

    // Convert goal dates to more readable format
    goals.forEach(element => {
      element.date = new Date(element.date).toLocaleDateString();
      element.achievedDate = new Date(element.achievedDate).toLocaleDateString();
    });

    const lastSubmission = data[data.length - 1];

    // Get sum of all submissions & percentage complete (used for progress bar style tracker)
    const totalSubmissionValue = data.length !== 0 ? data.reduce((a, b) => a + b) : 0;
    const percentageComplete = goals.length !== 0 ? Math.trunc((totalSubmissionValue / goals[goals.length - 1].value) * 100) : 0;
    const goalAchieved = percentageComplete >= 100;

    // If greater than 100% complete, set to 100% for progress bar width
    const progressWidth = percentageComplete > 100 ? 100 : percentageComplete;

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
      totalSubmissionValue: totalSubmissionValue,
      percentageComplete: percentageComplete,
      goalAchieved: goalAchieved,
      lastSubmission: lastSubmission,
      entries: entries,
      progressWidth: progressWidth
    });
  } catch (err) {
    console.error(err);
    console.log('No submission data.');

    try {
      const goals = tracker.goals;
      const units = tracker.units;

      res.render(`user/tracker/${type}tracker`, {
        title: `Greenfields Health - ${metric} Tracker`,
        loggedIn: true,
        goals: goals.filter(g => !g.isAchieved),
        units: units,
        metric: metric
      });
    } catch (err) {
      console.log('No data.');
      console.error(err);

      res.render(`user/tracker/${type}tracker`, {
        title: `Greenfields Health - ${metric} Tracker`,
        loggedIn: true,
        metric: metric
      });
    }
  }
});


// Gets all trackers for user. As access to subarrays is needed, does not use mustache but sends via json to front end js
router.get('/trackers', authCheck, async (req, res) => {
  try {
    const userId = req.user._id;
    trackerDao.setUserId(userId);
    const trackers = await trackerDao.findAll();
    res.json(trackers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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

//To save a new goal
router.post('/goal/submit', authCheck, async (req, res) => {
  goalDao.setUserId(req.user._id);
  const value = parseInt(req.body.value);
  const metric = req.body.metric;
  const date = new Date(req.body.date);

  try {
    const newGoal = {
      userId: req.user._id,
      date: date,
      metric: metric,
      value: value,
      isAchieved: false,
      achievedDate: null
    };
    await goalDao.saveGoal(newGoal);
    res.redirect(req.headers.referer);
  } catch (err) {
    console.error(err);
    // Redirect to an error page or dashboard with an error message
    res.redirect('/user/');
  }
});

router.post('/goal/update', authCheck, async (req, res) => {
  goalDao.setUserId(req.user._id);

  // Get goal properties from the request
  const isAchieved = req.body.isAchieved;
  const achievedDate = req.body.achievedDate;
  const value = req.body.value;
  const date = req.body.date;
  const goalId = req.body.goalId;

  // Find the goal matching the user ID, metric, and incomplete status
  try {
    const goal = await goalDao.findById(goalId);
    //Reset entries if progress bar goal
    const tracker = await trackerDao.findTrackerByMetric(goal.metric);
    if (tracker.type === "progress") await trackerDao.clearTrackerEntries(tracker._id)

    if (goal) {
      // Update goal properties with received values, or keep the current values if not received
      goal.date = date ? new Date(date) : goal.date;
      goal.value = value ? parseInt(value) : goal.value;
      goal.isAchieved = isAchieved ? isAchieved : goal.isAchieved;
      goal.achievedDate = achievedDate ? new Date(achievedDate) : goal.achievedDate;

      await goalDao.updateGoal(goal);

      res.status(200).send('Goal updated.');
    } else {
      res.status(404).send('Goal not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating goal.');
  }
});

//Delete a goal
router.post('/goal/delete', authCheck, async (req, res) => {
  const goalId = req.body.goalId;
  console.log(req.body.goalId)

  try {
    const numDeleted = await goalDao.delete(goalId);

    if (numDeleted > 0) {
      res.status(200).json({ message: 'Goal deleted' });
    } else {
      res.status(404).json({ message: 'Goal not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting goal' });
  }
});

//Deletes tracker and goals
router.delete('/tracker/delete/', authCheck, async (req, res) => {
  const metric = req.body.metric;

  try {

    await trackerDao.deleteTrackerByMetric(metric);
    await goalDao.deleteGoalsByMetric(metric);
    res.sendStatus(200);
  } catch (err) {
    
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
