const Course = require('../models/Course');
const mongoose = require('mongoose');

exports.listCourses = async (req, res, next) => {
	try {
		// Get search parameters from query
		const { 
			course_name, 
			course_number, 
			course_section, 
			semester, 
			course_status = 'Active' 
		} = req.query;

		// Build search filter
		const filter = { professor_id: req.user.id };
		
		if (course_name) {
			filter.course_name = { $regex: course_name, $options: 'i' };
		}
		if (course_number) {
			filter.course_number = { $regex: course_number, $options: 'i' };
		}
		if (course_section) {
			filter.course_section = { $regex: course_section, $options: 'i' };
		}
		if (semester) {
			filter.semester = { $regex: semester, $options: 'i' };
		}
		if (course_status) {
			filter.course_status = course_status;
		}

		const courses = await Course.find(filter);
		res.status(200).json(courses);
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};

exports.createCourse = async (req, res, next) => {
	try {
			const { course_name, course_number, course_section, semester } = req.body;
			if (!course_name || !course_number || !course_section || !semester) {
				const err = new Error('Course name, number, section, and semester are required.');
				err.code = 'VALIDATION_ERROR';
				err.status = 400;
				return next(err);
			}
			// Check for inactive course with same details
			let course = await Course.findOne({
				course_name,
				course_number,
				course_section,
				semester,
				professor_id: req.user.id,
				course_status: 'Inactive'
			});
			if (course) {
				course.course_status = 'Active';
				course.markModified('course_status');
				await course.save();
				return res.status(200).json({ id: course._id, message: 'Course reactivated.' });
			}
			// Otherwise, create new
			course = new Course({
				course_name,
				course_number,
				course_section,
				semester,
				professor_id: req.user.id,
				course_status: 'Active'
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