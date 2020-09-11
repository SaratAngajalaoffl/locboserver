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
	.get(authenticate.verifyUser, (req, res, next) => {
		res.statusCode = 403;
		res.end("GET operation not supported on /imageUpload");
	})
	.post(authenticate.verifyUser, upload.single("photo"), (req, res) => {
		res.status(200);
		res.setHeader("Content-Type", "application/json");
		res.json({
			uri: req.file.destination.replace("public", "") + "/" + req.file.filename,
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
