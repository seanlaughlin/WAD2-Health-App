const UserDao = require('../dao/userDao');
const bcrypt = require('bcrypt');

class UserService {
    constructor() {
        this.userDao = new UserDao('./database/users.db');
    }

    //Register user using UserDao and bCrypt to encrypt passwords
    async registerUser(name, email, password) {
        try {
            const hash = await bcrypt.hash(password, 10);
            const user = {
                name: name,
                email: email,
                trackers: [],
                password: hash,
            };
            const newUser = await this.userDao.saveUser(user);
            return newUser;
        } catch (error) {
            console.error('Unable to create user.');
        }
    }
}

module.exports = new UserService();