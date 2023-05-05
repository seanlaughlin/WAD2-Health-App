const Datastore = require("nedb");
const Tracker = require("../models/Tracker");

class TrackerDao {
  constructor(dbFilepath, userId) {
    console.log(dbFilepath);
    this.db = new Datastore({
      filename: dbFilepath,
      autoload: true,
    });
    //Set user id to find their associated trackers
    this.userId = "";
  }

  setUserId(id) {
    this.userId = id;
  }

  //save new tracker
  async saveTracker(tracker) {
    return new Promise((resolve, reject) => {
      this.db.insert(tracker, (err, newTracker) => {
        if (err) {
          console.log("Duplicate tracker error.");
        } else {
          resolve(newTracker);
        }
      });
    });
  }

  //find all trackers
  async findAll() {
    return new Promise((resolve, reject) => {
      this.db.find({ userId: this.userId }, (err, trackers) => {
        if (err) {
          reject(err);
        } else {
          resolve(trackers);
        }
      });
    });
  }

  //find one tracker by metric, for example 'weight'
  async findTrackerByMetric(metric) {
    return new Promise((resolve, reject) => {
      this.db.findOne(
        { metric: metric, userId: this.userId },
        (err, tracker) => {
          if (err) {
            reject(err);
          } else {
            resolve(tracker);
          }
        }
      );
    });
  }

  async updateTracker(tracker) {
  return new Promise(async (resolve, reject) => {
    try {
      const existingTracker = await this.findTrackerByMetric(tracker.metric);
      if (existingTracker) {
        console.log("Updating existing tracker.")
        this.db.update({ metric: tracker.metric, userId: this.userId }, tracker, {}, (err, numReplaced) => {
          if (err) {
            reject(err);
          } else {
            resolve(numReplaced);
            console.log("Existing tracker updated.")
          }
        });
      } else {
        this.db.insert(tracker, (err, newTracker) => {
          console.log(tracker)
          if (err) {
            console.log("Duplicate tracker error.");
            reject(err);
          } else {
            resolve(newTracker);
          }
        });
      }
    } catch (err) {
      reject(err);
    }
  });
}

  
}

module.exports = TrackerDao;
