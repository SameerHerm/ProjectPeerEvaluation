const Course = require('../models/Course');
const mongoose = require('mongoose');

exports.listCourses = async (req, res, next) => {
	try {
		const courses = await Course.find({ professor_id: req.user.id });
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
		const course = new Course({
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
		const course = await Course.findById(course_id);
		if (!course) {
			const err = new Error('Course not found.');
			err.code = 'NOT_FOUND';
			err.status = 404;
			return next(err);
		}
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
		const course = await Course.findByIdAndDelete(course_id);
		if (!course) {
			const err = new Error('Course not found.');
			err.code = 'NOT_FOUND';
			err.status = 404;
			return next(err);
		}
		res.status(200).json({ message: 'Course deleted.' });
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};