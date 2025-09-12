const Professor = require('../models/Professor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_EXPIRES_IN = '1h';

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			const err = new Error('Email and password are required.');
			err.code = 'VALIDATION_ERROR';
			err.status = 400;
			return next(err);
		}
		const professor = await Professor.findOne({ email });
		if (!professor) {
			const err = new Error('Invalid email or password.');
			err.code = 'AUTH_ERROR';
			err.status = 401;
			return next(err);
		}
		const isMatch = await bcrypt.compare(password, professor.password);
		if (!isMatch) {
			const err = new Error('Invalid email or password.');
			err.code = 'AUTH_ERROR';
			err.status = 401;
			return next(err);
		}
		// MFA check placeholder (implement actual logic as needed)
		if (professor.mfa_enabled) {
			// Return MFA required response (frontend will call verify-mfa)
			return res.status(200).json({ mfa_required: true, professor_id: professor._id });
		}
		// Generate JWT token
		const access_token = jwt.sign(
			{ id: professor._id, email: professor.email, name: professor.name },
			JWT_SECRET,
			{ expiresIn: JWT_EXPIRES_IN }
		);
		professor.last_login = new Date();
		await professor.save();
		res.status(200).json({
			access_token,
			professor: {
				id: professor._id,
				email: professor.email,
				name: professor.name,
				department: professor.department,
				mfa_enabled: professor.mfa_enabled,
				created_at: professor.created_at,
				last_login: professor.last_login
			}
		});
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};

exports.register = async (req, res, next) => {
	try {
		const { email, password, name, department } = req.body;
		if (!email || !password || !name || !department) {
			const err = new Error('All fields are required.');
			err.code = 'VALIDATION_ERROR';
			err.status = 400;
			return next(err);
		}
		const existing = await Professor.findOne({ email });
		if (existing) {
			const err = new Error('Email already registered.');
			err.code = 'DUPLICATE';
			err.status = 409;
			return next(err);
		}
		const hashed = await bcrypt.hash(password, 10);
		const professor = new Professor({ email, password: hashed, name, department });
		await professor.save();
		res.status(201).json({ message: 'Registration successful.', professor_id: professor._id });
	} catch (err) {
		err.code = err.code || 'SERVER_ERROR';
		err.status = err.status || 500;
		next(err);
	}
};

exports.logout = async (req, res) => {
  // For JWT, logout is handled on frontend by deleting token. Optionally, implement token blacklist.
  res.status(200).json({ message: 'Logout successful.' });
};

exports.refreshToken = async (req, res, next) => {
	// Placeholder: implement refresh token logic as needed
	const err = new Error('Refresh token not implemented.');
	err.code = 'NOT_IMPLEMENTED';
	err.status = 501;
	next(err);
};

exports.verifyMfa = async (req, res, next) => {
	// Placeholder: implement MFA verification logic as needed
	const err = new Error('MFA verification not implemented.');
	err.code = 'NOT_IMPLEMENTED';
	err.status = 501;
	next(err);
};