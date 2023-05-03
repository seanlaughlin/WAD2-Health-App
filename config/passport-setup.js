const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const keys = require("./keys");
const UserDao = require("../dao/userDao");
const User = require("../models/User");
const dao = new UserDao("./database/users.db");

//Serialise via user object identifier
passport.serializeUser((user, done) => {
  done(null, user._id);
});

//Deserialise user from id
passport.deserializeUser((id, done) => {
  dao.findUserById(id).then((user) => {
    done(null, user);
  });
});

//Google login strategy
passport.use(
  new GoogleStrategy(
    {
      //options/keys and secrets
      callbackURL: "http://localhost:3000/auth/google/redirect",
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      profile = profile._json;
      //check if user exists and load
      dao.findUserByGoogleId(profile.sub).then((currentUser) => {
        if (currentUser) {
          console.log("Existing User Profile Loaded: ");
          console.log(currentUser);
          done(null, currentUser);
        } else {
          //initialise new user obj and save
          const user = new User(
            profile.sub,
            profile.name,
            profile.email,
            new Array()
          );
          dao.saveUser(user).then((newUser) => {
            console.log("New User Added: ");
            console.log(newUser);
            done(null, newUser);
          });
        }
      });
    }
  )
);

//local login strategy using bcrypt
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      nameField: "name",
    },
    (email, password, done) => {
      dao.findUserByEmail(email).then((user) => {
        if (user) {
          bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
              return done(err);
            }
            if (!result) {
              return done(null, false);
            }
            if (user.googleId)
              return done(null, false, {
                message:
                  "Account already exists. Please sign in with your Google account.",
              });
          });
          console.log(user);
          return done(null, user);
        }
      });
    }
  )
);
