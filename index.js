const express = require("express");
const app = express();
const passportSetup = require("./config/passport-setup");
const cookieSession = require("cookie-session");
const keys = require("./config/keys");
const passport = require("passport");
require("dotenv").config();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  cookieSession({
    //1 day
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey],
  })
);

//init passport and session cookies
app.use(passport.initialize());
app.use(passport.session());

const path = require("path");
const public = path.join(__dirname, "public");
app.use(express.static(public));

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/images", express.static(__dirname + "/images"));

const mustache = require("mustache-express");
app.engine("mustache", mustache());
app.set("view engine", "mustache");

const authrouter = require("./routes/authroutes");
app.use("/auth", authrouter);

const userrouter = require("./routes/userroutes");
app.use("/user", userrouter);

const publicrouter = require("./routes/publicroutes");
app.use("/", publicrouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started. Ctrl^c to quit.");
});
