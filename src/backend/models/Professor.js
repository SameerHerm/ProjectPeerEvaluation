

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

#define_model
const mongoose = require("mongoose");

const professorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  department: String,
  mfa_enabled: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  last_login: Date
});

module.exports = mongoose.model("Professor", professorSchema);
