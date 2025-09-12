const Team = require('../models/Team');
const mongoose = require('mongoose');

exports.listTeams = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      const err = new Error('Invalid course ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const teams = await Team.find({ course_id }).populate('students');
    res.status(200).json(teams);
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.createTeams = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const { teams } = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      const err = new Error('Teams array required.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const created = await Team.insertMany(teams.map(t => ({ ...t, course_id })));
    res.status(201).json({ message: 'Teams created.', teams: created.map(t => t._id) });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const { course_id, team_id } = req.params;
    const updates = req.body;
    if (!mongoose.Types.ObjectId.isValid(team_id)) {
      const err = new Error('Invalid team ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const team = await Team.findOneAndUpdate({ _id: team_id, course_id }, updates, { new: true });
    if (!team) {
      const err = new Error('Team not found.');
      err.code = 'NOT_FOUND';
      err.status = 404;
      return next(err);
    }
    res.status(200).json({ message: 'Team updated.' });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const { course_id, team_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(team_id)) {
      const err = new Error('Invalid team ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const team = await Team.findOneAndDelete({ _id: team_id, course_id });
    if (!team) {
      const err = new Error('Team not found.');
      err.code = 'NOT_FOUND';
      err.status = 404;
      return next(err);
    }
    res.status(200).json({ message: 'Team deleted.' });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.autoAssignTeams = async (req, res, next) => {
  // Placeholder for auto-assign logic
  const err = new Error('Auto-assign not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};