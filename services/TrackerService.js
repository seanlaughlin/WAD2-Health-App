const path = require("path");
const TrackerDao = require('../dao/trackerDao');
const GoalDao = require('../dao/GoalDao');

class TrackerService {

    constructor() {
        this.trackerDao = new TrackerDao(path.resolve(__dirname, './database/trackers.db'));
    }

    setUserId(userId) {
        this.userId = userId;
        this.trackerDao.setUserId(userId);
    }

    //Create new tracker and save to db
    async createTracker(requestedMetric, units, category, trackerType) {

        const tracker = {
            userId: this.userId,
            metric: requestedMetric,
            category: category,
            type: trackerType,
            units: units,
            entries: []
        };

        const createdTracker = await this.trackerDao.saveTracker(tracker);
        return createdTracker;
    }

    //Check if tracker with same metric exists. Only 1 tracker is allowed per metric
    async doesTrackerExist(metric) {
        const existingTracker = await this.trackerDao.findTrackerByMetric(metric);
        console.log(existingTracker)
        if (existingTracker != null) return true;
        else return false;
    }

    //returns tracker by metric and user ID
    async getTrackerData(requestedMetric) {
        const tracker = await this.getTrackerByMetric(requestedMetric);

        const entries = tracker.entries;
        const type = tracker.type;

        entries.sort((d1, d2) => new Date(d1.date) - new Date(d2.date));

        entries.forEach((element) => {
            element.date = new Date(element.date).toLocaleDateString();
        });

        const dates = entries.map((entry) => entry.date);
        const data = entries.map((entry) => entry.value);
        const minimumValue = Math.min(...data);
        const units = tracker.units;
        const metric = tracker.metric;
        const goalDao = new GoalDao(path.resolve(__dirname, './database/goals.db'));
        goalDao.setUserId(this.userId);
        console.log(this.userId)
        const goals = await goalDao.findByMetric(metric);
        console.log('goals', goals)

        goals.forEach((element) => {
            element.date = new Date(element.date).toLocaleDateString();
            element.achievedDate = new Date(element.achievedDate).toLocaleDateString();
        });

        const lastSubmission = data[data.length - 1];
        const totalSubmissionValue = data.length !== 0 ? data.reduce((a, b) => a + b) : 0;
        const percentageComplete = goals.length !== 0 ? Math.trunc((totalSubmissionValue / goals[goals.length - 1].value) * 100) : 0;
        const goalAchieved = percentageComplete >= 100;
        const progressWidth = percentageComplete > 100 ? 100 : percentageComplete;

        return {
            labels: JSON.stringify(dates),
            data: JSON.stringify(data),
            suggestedMin: minimumValue,
            units: units,
            metric: metric,
            goals: goals.filter((g) => !g.isAchieved),
            goalsAchieved: goals.filter((g) => g.isAchieved),
            totalSubmissionValue: totalSubmissionValue,
            percentageComplete: percentageComplete,
            goalAchieved: goalAchieved,
            lastSubmission: lastSubmission,
            entries: entries,
            progressWidth: progressWidth,
            type: type
        }
    }

    async getTrackerByMetric(metric) {
        return await this.trackerDao.findTrackerByMetric(metric);
    }

    async getTrackersByCategory(category){
        return await this.trackerDao.findTrackersByCategory(category);
    }

    //Gets all trackers for the user
    async getAllTrackers() {
        return await this.trackerDao.findAll();
    }

    //Submit a new entry for tracker
    async submitEntry(value, metric, date) {
        const tracker = await this.trackerDao.findTrackerByMetric(metric);

        if (tracker) {
            tracker.entries.push({
                date: date,
                value: value
            });
            await this.trackerDao.updateTracker(tracker);
        } else {
            throw new Error('Tracker not found');
        }
    }

    //Deletes all entries for tracker. Used to reset progress bar style goals
    async clearTrackerEntries(trackerId) {
        return this.trackerDao.clearTrackerEntries(trackerId);
    };

    async deleteTrackerByMetric (metric) {
        await this.trackerDao.deleteTrackerByMetric(metric);
    };
}

module.exports = TrackerService;