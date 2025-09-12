const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  team_name: { type: String, required: true, trim: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);