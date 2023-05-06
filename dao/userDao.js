const Datastore = require("nedb");

class UserDao {
  constructor(dbFilepath) {
    this.db = new Datastore({
      filename: dbFilepath,
      autoload: true,
    });
  }

  async saveUser(user) {
    return new Promise((resolve, reject) => {
      this.db.insert(user, (err, newUser) => {
        if (err) {
          reject(err);
        } else {
          resolve(newUser);
        }
      });
    });
  }

  async findUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: id }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  //return user if exists by email
  async findUserByGoogleId(googleId) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ googleId: googleId }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ email: email }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }
}

module.exports = UserDao;
