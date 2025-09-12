
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Professor = require('../models/Professor');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// JWT authentication middleware
function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) {
		return res.status(401).json({ message: 'No token provided.' });
	}
	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ message: 'Invalid or expired token.' });
		}
		req.user = user;
		next();
	});
}

// Replace with your own secret in production
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Login a professor
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required.' });
		}
		const professor = await Professor.findOne({ email });
		if (!professor) {
			return res.status(401).json({ message: 'Invalid email or password.' });
		}
		const isMatch = await bcrypt.compare(password, professor.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid email or password.' });
		}
		// Generate JWT token
		const token = jwt.sign(
			{ id: professor._id, email: professor.email, name: professor.name },
			JWT_SECRET,
			{ expiresIn: '2h' }
		);
		res.status(200).json({
			message: 'Login successful.',
			access_token: token,
			professor: { name: professor.name, email: professor.email }
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error.' });
	}
});


// Register a new professor (open)
router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'All fields are required.' });
		}
		// Password validation: 10+ chars, at least 1 letter, 1 number, 1 special char
		const passwordValid =
			password.length >= 10 &&
			/[A-Za-z]/.test(password) &&
			/[0-9]/.test(password) &&
			/[^A-Za-z0-9]/.test(password);
		if (!passwordValid) {
			return res.status(400).json({ message: 'Password must be at least 10 characters and include a letter, a number, and a special character.' });
		}
		// Check if professor already exists
		const existing = await Professor.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: 'Professor already exists.' });
		}
		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);
		// Generate security token
		const securityToken = crypto.randomBytes(24).toString('hex');
		// Create and save professor
		const professor = new Professor({
			name,
			email,
			password: hashedPassword,
			securityToken
		});
		await professor.save();
		res.status(201).json({ message: 'Professor registered successfully.', securityToken });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error.' });
	}
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;