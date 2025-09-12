const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
console.log('authController:', authController); // DEBUG: Log the imported controller
const { authenticateToken } = require('../middleware/auth');

// Auth endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authenticateToken, authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/verify-mfa', authController.verifyMfa);

module.exports = router;