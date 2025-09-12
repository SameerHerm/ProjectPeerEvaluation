const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// AI feature endpoints
router.post('/summarize', authenticateToken, aiController.summarize);
router.post('/red-flags', authenticateToken, aiController.redFlags);
router.post('/sentiment', authenticateToken, aiController.sentiment);

module.exports = router;
