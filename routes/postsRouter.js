var express = require("express");
var bodyParser = require("body-parser");
var Posts = require("../models/posts");
var authenticate = require("../authenticate");

var PostRouter = express.Router();

PostRouter.use(bodyParser.json());

PostRouter.route("/")
	.get((req, res, next) => {
		Posts.find({})
			.populate({ path: "user", select: "username" })
			.then(
				(posts) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(posts);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res, next) => {
		req.body.user = req.user._id;
		Posts.create(req.body)
			.then((result) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(result);
			})
			.catch((err) => next(err));
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end("PUT not supported on this operation");
	})
	.delete(
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Posts.remove({}).then((resp) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(resp);
			});
		}
	);

PostRouter.route("/:postid")
	.get(authenticate.verifyUser, (req, res, next) => {
		Posts.findById(req.params.postid)
			.then(
				(post) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(post);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		res.statusCode = 403;
		res.end("Operation not supported");
	})
	.put(authenticate.verifyUser, (req, res, next) => {
		Posts.findById(req.params.postid).then((post) => {
			console.log(post);
			console.log(req.user._id);
			if (post.user.equals(req.user._id)) {
				post.set(req.body);
				post.save().then((post) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(post);
				});
			} else {
				res.statusCode = 403;
				res.end(
					"You are not the one that posted this,So you cannot delete this"
				);
			}
		});
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		console.log(Posts.findById(req.params.id));
		if (Posts.findById(req.params.id).user._id === req.user._id) {
			Posts.findByIdAndRemove(req.params._id).then((resp) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(resp);
			});
		} else {
			res.statusCode = 403;
			res.end("You are not the one that posted this,So you cannot delete this");
		}
	});

module.exports = PostRouter;
