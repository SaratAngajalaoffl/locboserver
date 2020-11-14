var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var usersRouter = require('./routes/usersRouter');
var PostRouter = require('./routes/postsRouter');
var uploadRouter = require('./routes/uploadRouter');
const categories = require('./models/categories');
var config = require('./config');
var mongoose = require('mongoose');

//App initialisation
var app = express();

//DB connection
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

connect.then(
	(db) => {
		console.log('Connected correctly to server');
	},
	(err) => {
		console.log(err);
	}
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
	session({
		name: 'session-id',
		secret: '12345-67890-09876-54321',
		saveUninitialized: false,
		resave: false,
		store: new FileStore(),
	})
);

//Passport initialisation
app.use(passport.initialize());
app.use(passport.session());

//Route Configurations
//Static
app.use(express.static(path.join(__dirname, 'public')));

//Router
app.use('/users', usersRouter);
app.use('/posts', PostRouter);
app.use('/imageUpload', uploadRouter);

app.get('/categories', (req, res, next) => {
	categories.find({}).then((categories) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(categories);
	});
});

app.post('/categories', (req, res, next) => {
	categories.create(req.body).then((result) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(result);
	});
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
