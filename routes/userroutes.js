const express = require("express");
const router = express.Router();
const moment = require('moment');
const path = require("path");
const UserController = require("../controllers/usercontroller");

const authCheck = (req, res, next) => {
  //if user isn't logged in redirect to login
  if (!req.user) {
    res.redirect("/login");
  } else {
    UserController.setServices(req.user._id);
    next();
  }
};

//Gets all trackers and renders user dashboard
router.get("/", authCheck, UserController.getGoalsAndTrackers);

//Creates new tracker
router.post('/tracker/create', authCheck, UserController.createTracker);

//Gets specified tracker
router.get('/tracker', authCheck, UserController.getTracker);

// Gets all trackers for user. As access to subarrays is needed, does not use mustache but sends via json to front end js
router.get('/trackers', authCheck, UserController.getAllTrackers);

//For a user to submit a new metric reading, and create tracker if doesn't exist
router.post('/metric/submit', authCheck, UserController.submitMetric);

//Submit a new goal
router.post('/goal/submit', authCheck, async (req, res) => {
  await UserController.submitGoal(req, res);
});

//Update existing goal
router.post('/goal/update', authCheck, UserController.updateGoal);

// Deletes a goal
router.delete('/goal/delete', authCheck, UserController.deleteGoal);

// Deletes tracker and goals
router.delete('/tracker/delete', authCheck, UserController.deleteTracker);

//shows user all goals
router.get('/goals', authCheck, UserController.getGoals);

//Sends user to relevant category guide
router.get('/fitness/guide', authCheck, UserController.fitnessGuide);
router.get('/nutrition/guide', authCheck, UserController.nutritionGuide);
router.get('/lifestyle/guide', authCheck, UserController.lifestyleGuide);

router.get('/nutrition/calculator', authCheck, UserController.calorieCalc);
router.get('/fitness/calculator', authCheck, UserController.bmiCalc);

module.exports = router;
