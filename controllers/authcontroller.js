const passport = require("passport");
const UserDao = require("../dao/userDao");
const bcrypt = require("bcrypt");

//Google login
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

//Local login (email and pass)
exports.localAuth = passport.authenticate("local", {
  successRedirect: "/user/",
  failureRedirect: `/login?message=Unable to log in. Please check details provided`,
  failureFlash: true,
});

//Local registering
exports.registerUser = async (req, res) => {
  const { email, password, name } = req.body;
  const dao = new UserDao("./database/users.db");
  const doesExist = await dao.findUserByEmail(email);
  if(doesExist){
    return res.redirect("/register?message=Unable to create account. User already exists.");
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.log("Error: Could not create user.");
      return res.redirect("/register?message=Unable to create account. User already exists.");
    }
    const user = {
      name: name,
      email: email,
      password: hash,
    };
    
    dao.saveUser(user);
    res.cookie("user", user._id);
    res.redirect("/login?message=Registered Successfully. Please log in.");
  });
};

//Logs user out
exports.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};

exports.authCheck = (req, res, next) => {
  // if user isn't logged in, redirect to login
  if (!req.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

//The redirect after google auth, used by passport
exports.googleRedirect = passport.authenticate("google");