var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var cors = require("cors");

var passport = require("passport");
var session = require("express-session");
var FileStore = require("session-file-store")(session);

var usersRouter = require("./routes/users");
var config = require("./config");

var app = express();

const mongoose = require("mongoose");

const url = config.mongoUrl;
const connect = mongoose.connect(url, { useNewUrlParser: true });

connect.then(
	(db) => {
		console.log("Connected correctly to server");
	},
	(err) => {
		console.log(err);
	}
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
	session({
		name: "session-id",
		secret: "12345-67890-09876-54321",
		saveUninitialized: false,
		resave: false,
		store: new FileStore(),
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/users", usersRouter);
app.use("/", (req, res, next) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "application/json");
	res.json(JSON.stringify({ test: "works" }));
});

app.use(express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
