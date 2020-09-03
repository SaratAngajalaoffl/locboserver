var mongoose = require("mongoose");
var Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

var Post = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	price: {
		type: Currency,
		required: true,
		min: 0,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		maxlength: 250,
		minlength: 10,
	},
	Category: {
		type: [String],
	},
	pic: {
		type: String,
		required: true,
	},
	forsale: Boolean,
	forrent: Boolean,
	// Area
});

module.exports = mongoose.model("Post", Post);
