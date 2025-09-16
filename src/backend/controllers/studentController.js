// Manual add student to course
exports.addStudent = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const { student_id, name, email } = req.body;
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      const err = new Error('Invalid course ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    if (!student_id || !name || !email) {
      const err = new Error('Missing required fields: student_id, name, email.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    // Check for duplicate student_id in this course
    const existing = await Student.findOne({ course_id, student_id });
    if (existing) {
      const err = new Error('Student with this ID already exists in this course.');
      err.code = 'DUPLICATE';
      err.status = 409;
      return next(err);
    }
    // Generate evaluation token
    const evaluation_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const student = new Student({ student_id, name, email, course_id, evaluation_token });
    await student.save();
    // Update student_count in the Course document
    const Course = require('../models/Course');
    const courseObjectId = new mongoose.Types.ObjectId(course_id);
    const studentCount = await Student.countDocuments({ course_id: courseObjectId });
    await Course.findByIdAndUpdate(courseObjectId, { student_count: studentCount });
    res.status(201).json({ message: 'Student added.', student });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};
const mongoose = require('mongoose');
const Student = require('../models/Student');

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
  // Update student_count in the Course document
  const Course = require('../models/Course');
  const courseObjectId = new mongoose.Types.ObjectId(course_id);
  const studentCount = await Student.countDocuments({ course_id: courseObjectId });
  console.log('Updating student_count for course:', course_id, 'to', studentCount);
  await Course.findByIdAndUpdate(courseObjectId, { student_count: studentCount });
  console.log('Course update result:', await Course.findById(courseObjectId));
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
  // Update student_count in the Course document
  const Course = require('../models/Course');
  const courseObjectId = new mongoose.Types.ObjectId(course_id);
  const studentCount = await Student.countDocuments({ course_id: courseObjectId });
  console.log('Updating student_count for course:', course_id, 'to', studentCount);
  await Course.findByIdAndUpdate(courseObjectId, { student_count: studentCount });
  console.log('Course update result:', await Course.findById(courseObjectId));
  res.status(200).json({ message: 'Students deleted.', deleted_count: result.deletedCount });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');

// Multer config (should be in middleware, but for demo, inline)
const upload = multer({ dest: 'uploads/' });

exports.uploadRoster = async (req, res, next) => {
  console.log('params:', req.params);
  console.log('file:', req.file);
  // Check for file
  if (!req.file) {
    const err = new Error('No file uploaded.');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    return next(err);
  }
  const { course_id } = req.params;
  const errors = [];
  const studentsToCreate = [];
  try {
    // Parse CSV and collect students
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        console.log('Parsed row:', row);
        // Validate required columns
        if (!row.student_id || !row.name || !row.email) {
          errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
          return;
        }
        // Prepare student object
        const evaluation_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        studentsToCreate.push({
          student_id: row.student_id,
          name: row.name,
          email: row.email,
          course_id,
          evaluation_token
        });
      })
      .on('end', async () => {
        try {
          // Deduplicate: filter out students that already exist in this course
          const courseObjectId = new mongoose.Types.ObjectId(course_id);
          const existingStudents = await Student.find({
            course_id: courseObjectId,
            student_id: { $in: studentsToCreate.map(s => s.student_id) }
          }).select('student_id');
          const existingIds = new Set(existingStudents.map(s => s.student_id));
          const filteredToCreate = studentsToCreate.filter(s => !existingIds.has(s.student_id));
          if (filteredToCreate.length === 0) {
            fs.unlinkSync(req.file.path);
            errors.push('All students in the file already exist in this course.');
            return res.status(200).json({
              message: 'No new students added.',
              students: [],
              errors
            });
          }
          // Insert only new students
          const created = await Student.insertMany(filteredToCreate, { ordered: false });
          // Update student_count in the Course document
          const Course = require('../models/Course');
          const studentCount = await Student.countDocuments({ course_id: courseObjectId });
          await Course.findByIdAndUpdate(courseObjectId, { student_count: studentCount });
          fs.unlinkSync(req.file.path); // Clean up temp file
          // Add error for duplicates if any were filtered
          if (filteredToCreate.length < studentsToCreate.length) {
            errors.push('Some students were not added because they already exist in this course.');
          }
          res.status(200).json({
            message: 'Roster uploaded.',
            students: created.map(s => s.student_id),
            errors
          });
        } catch (insertErr) {
          console.error('InsertMany error:', insertErr);
          fs.unlinkSync(req.file.path);
          errors.push('Some students could not be added (possible duplicates or DB error).');
          res.status(200).json({
            message: 'Roster uploaded with some errors.',
            students: [],
            errors
          });
        }
      });
  } catch (err) {
    err.code = 'SERVER_ERROR';
    err.status = 500;
    next(err);
  }
};