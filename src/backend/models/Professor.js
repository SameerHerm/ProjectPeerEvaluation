

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
	department: {
		type: String,
		required: true,
		trim: true
	},
	mfa_enabled: {
		type: Boolean,
		default: false
	},
	last_login: {
		type: Date
	},
	securityToken: {
		type: String
	}
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Professor', ProfessorSchema);