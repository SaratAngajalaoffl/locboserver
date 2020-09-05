const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const multer = require("multer");

const Storage = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, "public/images/uploads");
	},
	filename(req, file, callback) {
		callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
	},
});

const upload = multer({ storage: Storage });

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter
	.route("/")
	.get((req, res, next) => {
		res.statusCode = 403;
		res.end("GET operation not supported on /imageUpload");
	})
	.post(upload.single("photo"), (req, res) => {
		console.log("body", req.file.path);
		res.status(200).json({
			uri: req.file.uri,
		});
	})
	.put(authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /imageUpload");
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end("DELETE operation not supported on /imageUpload");
	});

module.exports = uploadRouter;
