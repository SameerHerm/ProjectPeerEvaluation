const Course = require('../models/Course');
const mongoose = require('mongoose');

exports.listCourses = async (req, res, next) => {
	try {
		const courses = await Course.find({ professor_id: req.user.id, is_active: { $ne: false } });
		res.status(200).json(courses);
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};

exports.createCourse = async (req, res, next) => {
	try {
			const { course_code, course_name, semester } = req.body;
			if (!course_code || !course_name || !semester) {
				const err = new Error('All fields are required.');
				err.code = 'VALIDATION_ERROR';
				err.status = 400;
				return next(err);
			}
			// Check for inactive course with same details
			let course = await Course.findOne({
				course_code,
				course_name,
				semester,
				professor_id: req.user.id,
				is_active: false
			});
			if (course) {
				course.is_active = true;
				course.markModified('is_active');
				await course.save();
				return res.status(200).json({ id: course._id, message: 'Course reactivated.' });
			}
			// Otherwise, create new
			course = new Course({
				course_code,
				course_name,
				semester,
				professor_id: req.user.id
			});
			await course.save();
			res.status(201).json({ id: course._id, message: 'Course created.' });
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};

exports.getCourse = async (req, res, next) => {
	try {
		const { course_id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(course_id)) {
			const err = new Error('Invalid course ID.');
			err.code = 'VALIDATION_ERROR';
			err.status = 400;
			return next(err);
		}
			let course = await Course.findById(course_id);
			if (!course) {
				const err = new Error('Course not found.');
				err.code = 'NOT_FOUND';
				err.status = 404;
				return next(err);
			}
			// Always get the latest student_count from the Student collection
			const Student = require('../models/Student');
			const studentCount = await Student.countDocuments({ course_id: course._id });
			// Debug log for diagnosis
			console.log('DEBUG getCourse:', { course_id, courseObjectId: course._id, studentCount });
			// Update the course object in memory (do not persist)
			course = course.toObject();
			course.student_count = studentCount;
			res.status(200).json(course);
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};

exports.updateCourse = async (req, res, next) => {
	try {
		const { course_id } = req.params;
		const updates = req.body;
		if (!mongoose.Types.ObjectId.isValid(course_id)) {
			const err = new Error('Invalid course ID.');
			err.code = 'VALIDATION_ERROR';
			err.status = 400;
			return next(err);
		}
		const course = await Course.findByIdAndUpdate(course_id, updates, { new: true });
		if (!course) {
			const err = new Error('Course not found.');
			err.code = 'NOT_FOUND';
			err.status = 404;
			return next(err);
		}
		res.status(200).json({ message: 'Course updated.' });
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};

exports.deleteCourse = async (req, res, next) => {
	try {
		const { course_id } = req.params;
			if (!mongoose.Types.ObjectId.isValid(course_id)) {
				const err = new Error('Invalid course ID.');
				err.code = 'VALIDATION_ERROR';
				err.status = 400;
				return next(err);
			}
			// Always cast course_id to ObjectId
			const courseObjectId = new mongoose.Types.ObjectId(course_id);
			// Set is_active to false instead of deleting
			const course = await Course.findByIdAndUpdate(courseObjectId, { is_active: false }, { new: true });
			if (!course) {
				const err = new Error('Course not found.');
				err.code = 'NOT_FOUND';
				err.status = 404;
				return next(err);
			}
			res.status(200).json({ message: 'Course set to inactive.' });
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};