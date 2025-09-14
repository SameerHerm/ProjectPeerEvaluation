const mongoose = require('mongoose');


const StudentSchema = new mongoose.Schema({
	student_id: { type: String, required: true, trim: true }, // University ID
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, trim: true, lowercase: true },
	course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
	team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
	evaluation_token: { type: String, required: true },
	evaluation_completed: { type: Boolean, default: false },
	created_at: { type: Date, default: Date.now }
});

// Add unique index to prevent duplicate students in a course
StudentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('Student', StudentSchema);