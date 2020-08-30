var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var FacebookTokenStrategy = require("passport-facebook-token");

var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

var config = require("./config.js");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
	return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
	new JwtStrategy(opts, (jwt_payload, done) => {
		console.log("JWT payload: ", jwt_payload);
		User.findOne({ _id: jwt_payload._id }, (err, user) => {
			if (err) {
				return done(err, false);
			} else if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		});
	})
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
	if (req.user.admin) {
		next();
	} else {
		err = new Error("You are not authorized to perform this operation!");
		next(err);
	}
};

exports.facebookPassport = passport.use(
	new FacebookTokenStrategy(
		{
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
		},
		(accessToken, refreshToken, profile, done) => {
			User.findOne({ username: profile.emails[0].value }, (err, user) => {
				if (err) {
					return done(err, false);
				}
				if (!err && user !== null) {
					err = new Error("User Already exists");
					return done(err, null);
				} else {
					user = new User({ username: profile.emails[0].value });
					user.save((err, user) => {
						if (err) return done(err, false);
						else return done(null, user);
					});
				}
			});
		}
	)
);
