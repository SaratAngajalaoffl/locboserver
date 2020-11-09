var express = require('express');
var UserRouter = express.Router();
var bodyParser = require('body-parser');
var User = require('../models/user');
var Chat = require('../models/chats');
var passport = require('passport');
var authenticate = require('../authenticate');

UserRouter.use(bodyParser.json());

/* GET User listing. */
UserRouter.route('/').get(
	authenticate.verifyUser,
	authenticate.verifyAdmin,
	(req, res, next) => {
		User.find({})
			.then(
				(User) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(User);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	}
);

UserRouter.post('/signup', (req, res, next) => {
	User.register(
		new User({ username: req.body.username }),
		req.body.password,
		(err, user) => {
			if (err) {
				res.statusCode = 500;
				res.setHeader('Content-Type', 'application/json');
				res.json({ err: err });
			} else {
				if (req.body.nickname) user.nickname = req.body.nickname;
				user.save((err, user) => {
					if (err) {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'application/json');
						res.json({ err: err });
						return;
					}
					passport.authenticate('local')(req, res, () => {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json({
							success: true,
							status: 'Registration Successful!',
						});
					});
				});
			}
		}
	);
});

UserRouter.post('/login', passport.authenticate('local'), (req, res) => {
	var token = authenticate.getToken({ _id: req.user._id });
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.json({
		success: true,
		token: token,
		user: req.user,
	});
});

UserRouter.get('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	} else {
		var err = new Error('You are not logged in!');
		err.status = 403;
		next(err);
	}
});

UserRouter.post(
	'/facebook/token',
	passport.authenticate('facebook-token'),
	async (req, res) => {
		if (req.user) {
			await req.user.setPassword(req.body.password);
			req.user.nickname = req.body.nickname;
			await req.user.save();
			var token = authenticate.getToken({ _id: req.user._id });
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json({
				success: true,
				token: token,
				user: req.user,
			});
		}
	}
);

UserRouter.route('/chats')
	.get(authenticate.verifyUser, (req, res, next) => {
		Chat.find({ $or: [{ buyer: req.user._id }, { seller: req.user._id }] })
			.populate({
				path: 'post',
				populate: { path: 'user', select: 'nickname' },
			})
			.populate({
				path: 'seller',
				select: 'nickname',
			})
			.populate({
				path: 'buyer',
				select: 'nickname',
			})
			.then((chats) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(chats);
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res, next) => {
		req.body.buyer = req.user._id;
		Chat.create(req.body)
			.then((response) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(response);
			})
			.catch((err) => next(err));
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation on /chats not supported');
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		Chat.findByIdAndDelete(req.body._id).then((result) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.json(result);
		});
	});

UserRouter.route('/chats/:chatID')
	.get(authenticate.verifyUser, (req, res, next) => {
		Chat.findById(req.params.chatID)
			.populate({
				path: 'post',
				populate: { path: 'user', select: 'nickname' },
			})
			.populate({
				path: 'seller',
				select: 'nickname',
			})
			.populate({
				path: 'buyer',
				select: 'nickname',
			})
			.then((chat) => {
				if (chat) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(chat);
				} else {
					res.statusCode = 404;
					res.end(
						'Couldnot find the chat with ChatID:',
						req.params.chatID
					);
				}
			})
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		res.statusCode = 403;
		res.end('POST not supported on this route');
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end('PUT not supported on this route');
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		Chat.findById(req.params.chatID).then((chat) => {
			if (chat) {
				chat.remove();
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(chat);
			} else {
				res.statusCode = 404;
				res.end(
					'Couldnot find the chat with ChatID:',
					req.params.chatID
				);
			}
		});
	});

UserRouter.route('/chats/:chatID/messages')
	.get(authenticate.verifyUser, (req, res, next) => {
		Chat.findById(req.params.chatID)
			.then((chat) => {
				if (chat) {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(chat.messages);
				} else {
					res.statusCode = 404;
					res.end(
						'Couldnot find the chat with ChatID:',
						req.params.chatID
					);
				}
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res, next) => {
		Chat.findById(req.params.chatID)
			.then((chat) => {
				if (chat) {
					chat.messages = chat.messages || [];
					chat.messages.push(req.body);
					chat.save()
						.then((chat) => {
							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.json(chat.messages[chat.messages.length - 1]);
						})
						.catch((err) => next(err));
				} else {
					res.statusCode = 404;
					res.end(
						'Couldnot find the chat with ChatID:',
						req.params.chatID
					);
				}
			})
			.catch((err) => next(err));
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end('PUT not supported on this route');
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		Chat.findById(req.params.chatID).then((chat) => {
			if (chat) {
				messages = chat.messages;
				chat.messages = [];
				chat.save().then(() => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(messages);
				});
			} else {
				res.statusCode = 404;
				res.end(
					'Couldnot find the chat with ChatID:',
					req.params.chatID
				);
			}
		});
	});

module.exports = UserRouter;
