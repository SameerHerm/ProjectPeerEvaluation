const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  evaluator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  ratings: {
    contribution: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    reliability: { type: Number, min: 1, max: 5 },
    collaboration: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 }
  },
  comments: {
    strengths: String,
    improvements: String,
    additional: String
  },
  submitted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);