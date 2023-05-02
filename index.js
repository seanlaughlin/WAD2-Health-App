const express = require("express");
const app = express();
require("dotenv").config();

app.use(
  express.urlencoded({
    extended: true,
  })
);

const path = require("path");
const public = path.join(__dirname, "public");
app.use(express.static(public));

app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);

const mustache = require("mustache-express");
app.engine("mustache", mustache());
app.set("view engine", "mustache");

const router = require("./routes/publicroutes");
app.use("/", router);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started. Ctrl^c to quit.");
});
