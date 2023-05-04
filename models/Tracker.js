class Tracker {
  constructor(userId, metric, unit, entries, target) {
    this.userId = userId;
    this.metric = metric;
    this.unit = unit;
    this.entries = entries;
    this.target = target;
  }
}
module.exports = Tracker;
