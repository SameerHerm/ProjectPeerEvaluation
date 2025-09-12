const Student = require('../models/Student');
const mongoose = require('mongoose');

exports.listStudents = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      const err = new Error('Invalid course ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const students = await Student.find({ course_id });
    res.status(200).json(students);
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { course_id, student_id } = req.params;
    const updates = req.body;
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      const err = new Error('Invalid student ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const student = await Student.findOneAndUpdate({ _id: student_id, course_id }, updates, { new: true });
    if (!student) {
      const err = new Error('Student not found.');
      err.code = 'NOT_FOUND';
      err.status = 404;
      return next(err);
    }
    res.status(200).json({ message: 'Student updated.' });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const { course_id, student_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      const err = new Error('Invalid student ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const student = await Student.findOneAndDelete({ _id: student_id, course_id });
    if (!student) {
      const err = new Error('Student not found.');
      err.code = 'NOT_FOUND';
      err.status = 404;
      return next(err);
    }
    res.status(200).json({ message: 'Student deleted.' });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.bulkDeleteStudents = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const { student_ids } = req.body;
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      const err = new Error('student_ids array required.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const result = await Student.deleteMany({ _id: { $in: student_ids }, course_id });
    res.status(200).json({ message: 'Students deleted.', deleted_count: result.deletedCount });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.uploadRoster = async (req, res, next) => {
  // Placeholder for file upload logic
  const err = new Error('File upload not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};