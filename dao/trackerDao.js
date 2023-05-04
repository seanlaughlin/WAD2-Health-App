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
    this.userId = userId;
    //prevents multiple trackers being saved with same metric
    this.db.ensureIndex({ fieldName: "metric", unique: true });
  }

  //save new tracker
  async saveTracker(tracker) {
    return new Promise((resolve, reject) => {
      this.db.insert(tracker, (err, newTracker) => {
        if (err) {
          console.log("Duplicate tracker name error.");
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
}

module.exports = TrackerDao;
