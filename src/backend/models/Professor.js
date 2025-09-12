const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	securityToken: {
		type: String
	}
}, { timestamps: true });

module.exports = mongoose.model('Professor', ProfessorSchema);