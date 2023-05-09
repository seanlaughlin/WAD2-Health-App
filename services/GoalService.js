const path = require("path");
const GoalDao = require("../dao/GoalDao");
const TrackerDao = require("../dao/trackerDao");

class GoalService {
    constructor() {
        this.goalDao = new GoalDao(path.resolve(__dirname, '../database/goals.db'));
    }

    setUserId(userId) {
        this.userId = userId;
        this.goalDao.setUserId(userId);
    }

    async findById(goalId) {
        return await this.goalDao.findById(goalId);
    }

    async getGoalsAndTrackers() {
        const trackerDao = new TrackerDao(path.resolve(__dirname, '../database/trackers.db'));
        //Set dao user id's to use in locating objects
        trackerDao.setUserId(this.userId);
        const goals = await this.goalDao.findAll();
        const trackers = await trackerDao.findAll();

        // Get goals for each tracker
        const lifestyleTrackers = trackers.filter((t) => t.category === "Lifestyle");
        const nutritionDietTrackers = trackers.filter((t) => t.category === "Nutrition and Diet");
        const fitnessTrackers = trackers.filter((t) => t.category === "Fitness");

        const achievedGoals = goals.filter((g) => g.isAchieved);
        const outstandingGoals = goals.filter((g) => !g.isAchieved);

        // Add goals to each tracker
        const fitnessTrackersWithGoals = await this.getTrackersWithGoals(fitnessTrackers);
        const nutritionDietTrackersWithGoals = await this.getTrackersWithGoals(nutritionDietTrackers);
        const lifestyleTrackersWithGoals = await this.getTrackersWithGoals(lifestyleTrackers);

        // Return values to controller
        return {
            lifestyleTrackers: lifestyleTrackersWithGoals,
            nutritionDietTrackers: nutritionDietTrackersWithGoals,
            fitnessTrackers: fitnessTrackersWithGoals,
            goalsAchieved: achievedGoals.length,
            goalsOutstanding: outstandingGoals.length,
            fitnessTrackersWithGoals: fitnessTrackersWithGoals
        };
    }

    //Returns trackers and their associated goals split into achieved and outstanding
    async getTrackersWithGoals(trackers) {
        return Promise.all(
            trackers.map(async (tracker) => {
                const trackerGoals = await this.goalDao.findByMetric(tracker.metric);
                const achievedTrackerGoals = trackerGoals.filter((goal) => goal.isAchieved);
                const outstandingTrackerGoals = trackerGoals.filter((goal) => !goal.isAchieved);
                return {
                    tracker,
                    achievedGoals: achievedTrackerGoals,
                    outstandingGoals: outstandingTrackerGoals,
                };
            })
        );
    }

    //Finds tracker by specified metric
    async findByMetric(metric) {
        const goals = await this.goalDao.findByMetric(metric);
        console.log(goals)
        return goals;
    }

    //Save new goal
    async saveGoal(newGoal) {
        return await this.goalDao.saveGoal(newGoal);
    }

    //Update goal
    async updateGoal(goal) {
        return await this.goalDao.updateGoal(goal);
    }

    //Delete goal by id
    async deleteGoal(goalId) {
        return await this.goalDao.delete(goalId);
    }

    //Deletes all goals matching metric
    async deleteGoalsByMetric(metric) {
        await this.goalDao.deleteGoalsByMetric(metric);
    }

    //Converts goal dates and achieved dates from UNIX to dd/mm/yyyy
    async convertGoals(goals) {
        const convertedGoals = goals.map(goal => {
          const convertedDate = goal.date ? goal.date.toLocaleDateString('en-GB') : null;
          const convertedAchievedDate = goal.achievedDate ? goal.achievedDate.toLocaleDateString('en-GB') : null;
          return { ...goal, date: convertedDate, achievedDate: convertedAchievedDate };
        });
        return convertedGoals;
      }

    //Gets all goals for user
    async findAll() {
        return await this.goalDao.findAll();
    };

    async findByCategory(category){
        return await this.goalDao.findByCategory(category);
    }
}

module.exports = GoalService;
