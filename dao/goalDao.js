const Datastore = require("nedb");

class GoalDao {
    constructor(dbFilepath, userId) {
        this.db = new Datastore({
            filename: dbFilepath,
            autoload: true,
        });
        //Set tracker id to find their associated goals
        this.userId = userId;
    }

    setUserId(id) {
        this.userId = id;
    }

    //save new goal
    async saveGoal(goal) {
        return new Promise((resolve, reject) => {
            this.db.insert(goal, (err, newGoal) => {
                if (err) {
                    console.log("Duplicate goal error.");
                    console.log(err)
                } else {
                    resolve(newGoal);
                }
            });
        });
    }

    //find all
    async findAll() {
        return new Promise((resolve, reject) => {
            this.db.find({ userId: this.userId }, (err, goals) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(goals);
                }
            });
        });
    }

    //find one outstanding goal by metric, for example 'weight'
    async findOutstandingByMetric(metric) {
        return new Promise((resolve, reject) => {
            this.db.find(
                { metric: metric, userId: this.userId, isAchieved: false },
                (err, goals) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(goals);
                    }
                }
            );
        });
    }

    async findAchievedByMetric(metric) {
        return new Promise((resolve, reject) => {
            this.db.find({ userId: this.userId, metric: metric, isAchieved: true }, (err, goals) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(goals);
                }
            });
        });
    }


    async findByMetric(metric) {
        return new Promise((resolve, reject) => {
            this.db.find({ userId: this.userId, metric: metric }, (err, goals) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(goals);
                }
            });
        });
    }

    //Find one goal by ID
    async findById(id) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: id }, (err, goal) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(goal);
                }
            });
        });
    }

    //Update goal object with receieved object
    async updateGoal(goal) {
        try {
            const numUpdated = await this.db.update({ _id: goal._id }, { $set: goal }, {});
            return numUpdated;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async findByCategory(category) {
        return new Promise((resolve, reject) => {
            this.db.find({ userId: this.userId, category: category, isAchieved: true }, (err, goals) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(goals);
                }
            });
        });
    }

    //Delete a goal from a tracker
    async delete(id) {
        return new Promise((resolve, reject) => {
            this.db.update(
                { _id: id, isAchieved: false },
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
}

module.exports = GoalDao;