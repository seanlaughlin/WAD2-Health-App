const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const keys = require("./config/keys");
const passport = require("passport");
const passportSetup = require("./config/passport-setup");
const flash = require("connect-flash");
const bodyParser = require('body-parser');
require("dotenv").config();

app.use(
  express.urlencoded({
    extended: true,
  })
);

//Set up cookie for auth
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
app.use(cookieParser());
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Link paths to directories for static content
const path = require("path");
const public = path.join(__dirname, "public");
app.use(express.static(public));

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/scripts"))
app.use("/images", express.static(__dirname + "/images"));

//Set mustache up
const mustache = require("mustache-express");
app.engine("mustache", mustache());
app.set("view engine", "mustache");

//Set routers
const authRouter = require(__dirname + '/routes/authroutes');
app.use("/auth", authRouter);

const userrouter = require(__dirname + '/routes/userroutes');
app.use("/user", userrouter);

const publicrouter = require(__dirname + '/routes/publicroutes');
app.use("/", publicrouter);

//Start server on port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log("Server started. Ctrl^c to quit.");
});
