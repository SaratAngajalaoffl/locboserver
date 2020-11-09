var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Message = new Schema({
	text: {
		type: String,
		required: true,
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
},{
	timestamps: true,
});


var Chat = new Schema(
	{
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Post",
		},
		messages: [Message],
		buyer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",	
		}
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Chat", Chat);