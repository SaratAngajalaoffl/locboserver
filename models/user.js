var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var Message = new Schema({
	text: {
		type: String,
		required: true,
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	reciever: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

var Chats = new Schema(
	{
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
		},
		messages: [Message],
	},
	{
		timestamps: true,
	}
);

User = new Schema({
	nickname: {
		type: String,
		default: "",
	},
	chats: [Chats],
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
