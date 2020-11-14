var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Category = new Schema({
	name: {
		type: String,
		maxlength: 10,
	},
});

module.exports = mongoose.model('Category', Category);
