class User {
  constructor(googleId, name, email, trackers, password) {
    this.googleId = googleId;
    this.name = name;
    this.email = email;
    this.trackers = trackers;
    this.password = password;
  }
}
module.exports = User;
