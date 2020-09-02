var express = require("express");
var bodyParser = require("body-parser");
var Posts = require("../models/posts");
var authenticate = require("../authenticate");

var PostRouter = express.Router();

PostRouter.use(bodyParser.json());

PostRouter.route("/")
	.get(authenticate.verifyUser, (req, res, next) => {
		Posts.find({})
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

module.exports = PostRouter;
