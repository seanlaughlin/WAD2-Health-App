const Datastore = require("nedb");

class TrackerDao {
  constructor(dbFilepath) {
    this.db = new Datastore({
      filename: dbFilepath,
      autoload: true,
      schema: {
        userId: { type: String, required: true },
        metric: { type: String, unique: true, required: true },
        category: { type: String, required: true },
        type: { type: String, required: true },
        units: { type: String, required: false },
        entries: { type: Array, required: false },
      }
    });
  }

  //Validate against schema
  validateTracker(data, schema) {
    const result = {};
    result.isValid = true;
    result.errors = [];

    for (const property in schema) {
      const { required } = schema[property];
      const value = data[property];

      if (required && (value === undefined || value === null)) {
        result.isValid = false;
        result.errors.push(`'${property}' is required.`);
      }
    }
    return result;
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
          console.log(err)
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

  //Find by category (nutrition and diet, fitness, lifestyle)
  async findTrackersByCategory(category) {
    return new Promise((resolve, reject) => {
      this.db.find({ userId: this.userId, category: category }, (err, trackers) => {
        if (err) {
          reject(err);
        } else {
          resolve(trackers);
        }
      });
    });
  }

  //Update tracker, found by metric and userId
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

  //Delete a goal from a tracker
  async deleteGoalFromTracker(metric) {
    return new Promise((resolve, reject) => {
      this.db.update(
        { metric: metric, 'goals.isAchieved': false },
        { $pull: { goals: { isAchieved: false } } },
        { multi: true },
        (err, numAffected) => {
          if (err) {
            reject(err);
          } else {
            resolve(numAffected);
          }
        }
      );
    });
  }

  //Used to delete all entries for a tracker, by user request or upon marking a progress tracker goal as achieved
  async clearTrackerEntries(trackerId) {
    try {
      const numUpdated = await this.db.update({ _id: trackerId }, { $set: { entries: [] } }, {});
      return numUpdated;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteTrackerByMetric(metric) {
    let numRemoved; // Declare the variable outside the try-catch block

    try {
      numRemoved = await this.db.remove({ metric: metric }, { multi: true });
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error to propagate it
    }

    return numRemoved; // Return the value outside the try-catch block
  }
}

module.exports = TrackerDao;
