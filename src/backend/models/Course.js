const mongoose = require('mongoose');

const EvaluationStatusSchema = new mongoose.Schema({
	total: { type: Number, default: 0 },
	completed: { type: Number, default: 0 },
	pending: { type: Number, default: 0 }
}, { _id: false });

const CourseSchema = new mongoose.Schema({
	course_code: { type: String, required: true, trim: true },
	course_name: { type: String, required: true, trim: true },
	semester: { type: String, required: true, trim: true },
	professor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor', required: true },
	student_count: { type: Number, default: 0 },
	team_count: { type: Number, default: 0 },
	is_active: { type: Boolean, default: true },
	evaluation_status: { type: EvaluationStatusSchema, default: () => ({}) },
	created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);