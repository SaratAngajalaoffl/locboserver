var express = require("express");
var UserRouter = express.Router();
var bodyParser = require("body-parser");
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");

UserRouter.use(bodyParser.json());

/* GET User listing. */
UserRouter.route("/").get(
	authenticate.verifyUser,
	authenticate.verifyAdmin,
	(req, res, next) => {
		User.find({})
			.then(
				(User) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(User);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	}
);

UserRouter.post("/signup", (req, res, next) => {
	User.register(
		new User({ username: req.body.username }),
		req.body.password,
		(err, user) => {
			if (err) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				res.json({ err: err });
			} else {
				if (req.body.nickname) user.nickname = req.body.nickname;
				user.save((err, user) => {
					if (err) {
						res.statusCode = 500;
						res.setHeader("Content-Type", "application/json");
						res.json({ err: err });
						return;
					}
					passport.authenticate("local")(req, res, () => {
						res.statusCode = 200;
						res.setHeader("Content-Type", "application/json");
						res.json({ success: true, status: "Registration Successful!" });
					});
				});
			}
		}
	);
});

UserRouter.post("/login", passport.authenticate("local"), (req, res) => {
	var token = authenticate.getToken({ _id: req.user._id });
	res.statusCode = 200;
	res.setHeader("Content-Type", "application/json");
	res.json({
		success: true,
		token: token,
		user: req.user,
	});
});

UserRouter.get("/logout", (req, res) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie("session-id");
		res.redirect("/");
	} else {
		var err = new Error("You are not logged in!");
		err.status = 403;
		next(err);
	}
});

UserRouter.post(
	"/facebook/token",
	passport.authenticate("facebook-token"),
	async (req, res) => {
		if (req.user) {
			await req.user.setPassword(req.body.password);
			req.user.nickname = req.body.nickname;
			await req.user.save();
			var token = authenticate.getToken({ _id: req.user._id });
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.json({
				success: true,
				token: token,
				user: req.user,
			});
		}
	}
);

UserRouter.route("/chats")
	.get(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id)
			.populate({
				path: "chats.post",
				populate: { path: "user", select: "nickname" },
			})
			.then((user) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(user.chats);
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id)
			.then((user) => {
				user.chats = user.chats || [];
				user.chats.push(req.body);
				user
					.save()
					.then((user) => {
						User.findById(user._id)
							.populate("chats.post")
							.then((user) => {
								res.statusCode = 200;
								res.setHeader("Content-Type", "application/json");
								res.json(user);
							})
							.catch((err) => next(err));
					})
					.catch((err) => next(err));
			})
			.catch((err) => next(err));
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end("PUT operation on /chats not supported");
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id).then((user) => {
			var chats = User.chats;
			user.chats = [];
			user.save();

			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.json(chats);
		});
	});

UserRouter.route("/chats/:chatID")
	.get(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id)
			.then((user) => {
				if (user.chats.id(req.params.chatID)) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(user.chats.id(req.params.chatID));
				} else {
					res.statusCode = 404;
					res.end("Couldnot find the chat with ChatID:", req.params.chatID);
				}
			})
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		res.statusCode = 403;
		res.end("POST not supported on this route");
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end("PUT not supported on this route");
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id).then((user) => {
			if (user.chats.id(req.params.chatID)) {
				chat = user.chats.id(req.params.chatID);
				User.chats.id(req.params.chatID).remove();
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(chat);
			} else {
				res.statusCode = 404;
				res.end("Couldnot find the chat with ChatID:", req.params.chatID);
			}
		});
	});

UserRouter.route("/chats/:chatID/messages")
	.get(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id)
			.then((user) => {
				if (user.chats.id(req.params.chatID)) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(user.chats.id(req.params.chatID).messages);
				} else {
					res.statusCode = 404;
					res.end("Couldnot find the chat with ChatID:", req.params.chatID);
				}
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id)
			.then((user) => {
				if (user.chats.id(req.params.chatID)) {
					user.chats.id(req.params.chatID).messages =
						user.chats.id(req.params.chatID).messages || [];
					user.chats.id(req.params.chatID).messages.push(req.body);
					user.save().then((user) => {
						User.findById(user._id).then((user) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(user.chats.id(req.params.chatID).messages);
						});
					});
				} else {
					res.statusCode = 404;
					res.end("Couldnot find the chat with ChatID:", req.params.chatID);
				}
			})
			.catch((err) => next(err));
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end("PUT not supported on this route");
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		User.findById(req.user._id).then((user) => {
			if (user.chats.id(req.params.chatID)) {
				messages = user.chats.id(req.params.chatID).messages;
				user.chats.id(req.params.chatID).messages = [];
				user.save().then(() => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(messages);
				});
			} else {
				res.statusCode = 404;
				res.end("Couldnot find the chat with ChatID:", req.params.chatID);
			}
		});
	});

module.exports = UserRouter;
