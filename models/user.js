var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

User = new Schema({
	nickname: {
		type: String,
		default: "",
	},
	posts: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "Post",
	},
	pic: {
		type: String,
		default: null,
	},
	rating: {
		type: Number,
		min: 0,
		max: 5,
	},
	rating_number: {
		type: Number,
		min: 0,
	},
	admin: {
		type: Boolean,
		default: false,
	},
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
