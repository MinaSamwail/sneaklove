require("dotenv").config();

require("./config/mongo"); // database initial setup
require("./helpers/hbs"); // utils for hbs templates

// base dependencies
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const flash = require("connect-flash");
const hbs = require("hbs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const dev_mode = false;
const logger = require("morgan");

// config logger (pour debug)
app.use(logger("dev"));
// console.log(process.env.MONGO_URI);
// initial config
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "hbs");
hbs.registerPartials(path.join(__dirname, "/views/partial"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// SESSION SETUP
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 60000 }, // in millisec
    store: new MongoStore({
      mongooseConnection: mongoose.connection, // you can store session infos in mongodb :)
      ttl: 24 * 60 * 60, // 1 day
    }),
    saveUninitialized: true,
    resave: true,
  })
);

// below, site_url is used in partials/shop_head.hbs to perform ajax request (var instead of hardcoded)
app.locals.site_url = process.env.SITE_URL;

app.use(flash());

// CUSTOM MIDDLEWARES

if (dev_mode === true) {
  app.use(require("./middlewares/devMode")); // triggers dev mode during dev phase
  app.use(require("./middlewares/debugSessionInfos")); // displays session debug
}

app.use(require("./middlewares/exposeLoginStatus"));
app.use(require("./middlewares/exposeFlashMessage"));

// routers
const indexRouter = require("./routes/index");
app.use("/", indexRouter);
// app.use("/", require("./routes/index"));

//route dashboard
const dashboardRouter = require("./routes/dashboard_sneaker");
app.use("/dashboard", dashboardRouter);

// route AUTH
const authRouter = require("./routes/auth");
app.use("/", authRouter);

module.exports = app;
