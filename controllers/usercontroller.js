const path = require("path");
const GoalService = require(path.resolve(__dirname, "../services/GoalService"));
const TrackerService = require(path.resolve(__dirname, "../services/TrackerService"));

//instantiate the two services used
const goalService = new GoalService();
const trackerService = new TrackerService();

const UserController = {

  //Set user id within services to be used for reference
  setServices(userId) {
    goalService.setUserId(userId);
    trackerService.setUserId(userId);
  },

  getServiceId() {
    console.log(goalService.userId);
  },

  //Uses goal service to get goals and trackers and send to front end in JSON
  getGoalsAndTrackers: async (req, res) => {
    try {
      const data = await goalService.getGoalsAndTrackers();
      data.title = "Greenfields Health - User Dashboard";
      data.loggedIn = true;
      data.name = req.user.name;

      res.render("user/dashboard", data)
    } catch (error) {
      console.log(error);
      res.status(500).render("error/500");
    }
  },

  //Create new tracker from request
  createTracker: async (req, res) => {
    try {
      const requestedMetric = req.body.metric;
      const units = req.body.units;
      const category = req.body.category;
      const trackerType = req.body.trackerType;

      if (await trackerService.doesTrackerExist(requestedMetric)) {
        // Return an error to the front end
        return res.status(400).json({ error: 'Tracker with the specified metric already exists. Please input a new metric.' });
      }
      else {
        const createdTracker = await trackerService.createTracker(requestedMetric, units, category, trackerType);
        res.json(createdTracker);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Unable to create tracker.' });
    }
  },

  //returns tracker by metric and user ID
  getTracker: async (req, res) => {
    try {
      const requestedMetric = req.query.metric;
      const trackerData = await trackerService.getTrackerData(requestedMetric);
      if (!trackerData || !requestedMetric) {
        res.redirect('/user/')
        return;
      }
      else {
        trackerData.loggedIn = true;
        res.render(`user/tracker/${trackerData.type}tracker`, trackerData);
      }
    } catch (error) {
      console.log(error);
      res.render('error/500');
    }
  },

  //Returns all trackers as json
  getAllTrackers: async (req, res) => {
    try {
      const trackers = await trackerService.getAllTrackers();
      res.json(trackers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error, unable to fetch trackers.' });
    }
  },

  submitMetric: async (req, res) => {
    try {
      const value = parseInt(req.body.value);
      const metric = req.body.metric;
      const date = req.body.date;

      await trackerService.submitEntry(value, metric, date);
      res.redirect(req.headers.referer);
    } catch (error) {
      console.error(error);
      res.redirect('/error'); // !change! to error page or dashboard with an error message
    }
  },

  submitGoal: async (req, res) => {
    const value = req.body.value;
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
      await goalService.saveGoal(newGoal);
      res.redirect(req.headers.referer);
    } catch (err) {
      console.error(err);
      // Redirect to an error page or dashboard with an error message
      res.redirect('/user/');
    }
  },

  //Updates goal after user edit or marking as complete
  updateGoal: async (req, res) => {
    // Get goal properties from the request
    const isAchieved = req.body.isAchieved;
    const achievedDate = req.body.achievedDate;
    const value = req.body.value;
    const date = req.body.date;
    const goalId = req.body.goalId;

    // Find the goal matching the user ID, metric, and incomplete status
    try {
      const goal = await goalService.findById(goalId);
      // Reset entries if progress bar goal
      const tracker = await trackerService.getTrackerByMetric(goal.metric);
      if (tracker.type === 'progress' && isAchieved ) await trackerService.clearTrackerEntries(tracker._id);

      if (goal) {
        // Update goal properties with received values, or keep the current values if not received
        goal.date = date ? new Date(date) : goal.date;
        goal.value = value ? value : goal.value;
        goal.isAchieved = isAchieved ? isAchieved : goal.isAchieved;
        goal.achievedDate = achievedDate ? new Date(achievedDate) : goal.achievedDate;

        await goalService.updateGoal(goal);

        res.status(200).send('Goal updated.');
      } else {
        res.status(404).send('Goal not found.');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating goal.');
    }
  },

  //Delete a goal by goal ID
  deleteGoal: async (req, res) => {
    const goalId = req.body.goalId;

    try {
      const numDeleted = await goalService.deleteGoal(goalId);

      if (numDeleted > 0) {
        //Successful deleted status
        res.status(204).json({ message: 'Goal deleted' });
      } else {
        res.status(404).json({ message: 'Goal not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting goal' });
    }
  },

  //Gets all goals for user
  async getGoals(req, res){
    // Check category of goals to be loaded (nutrition and diet, lifestyle, fitness, all).
    // tracker dao is passed to goal dao to allow category lookup of metric
    const category = req.query.category;
    const goals = category === 'All' ? await goalService.findAll() : await goalService.findByCategory(category);

    // Create lists of goals achieved and outstanding and converts dates to dd/mm/yyyy
    const [goalsAchieved, goalsOutstanding] = await Promise.all([
      goalService.convertGoals(goals.filter(g => g.isAchieved)),
      goalService.convertGoals(goals.filter(g => !g.isAchieved))
    ]);

    // Render the goals page
    res.render('user/goals', {
      title: `Greenfields Health - ${category} Goals`,
      loggedIn: true,
      goalsAchieved: goalsAchieved,
      goalsOutstanding: goalsOutstanding,
      category: category
    });
  },

  //Delete tracker by metric
  deleteTracker: async (req, res) => {
    const metric = req.body.metric;

    try {
      await trackerService.deleteTrackerByMetric(metric);
      await goalService.deleteGoalsByMetric(metric);

      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error deleting Tracker' });
    }
  },

  fitnessGuide: (req, res) => {
    res.render('user/fitness/guide', {
      loggedIn: true,
      title: 'Greenfields Health - Fitness Guide'
    })
  },

  nutritionGuide: (req, res) => {
    res.render('user/nutrition/guide', {
      loggedIn: true,
      title: 'Greenfields Health - Nutrition & Diet Guide'
    })
  },

  lifestyleGuide: (req, res) => {
    res.render('user/lifestyle/guide', {
      loggedIn: true,
      title: 'Greenfields Health - Lifestyle Guide'
    })
  },

  calorieCalc: (req, res) => {
    res.render('user/nutrition/calculator', {
      loggedIn: true,
      title: 'Greenfields Health - Calorie Calculator'
    })
  },

  bmiCalc: (req, res) => {
    res.render('user/fitness/calculator', {
      loggedIn: true,
      title: 'Greenfields Health - BMI Calculator'
    })
  }

}

module.exports = UserController;