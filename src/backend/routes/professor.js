const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const professorController = require('../controllers/professorController');

// Get AI concerning words
router.get('/ai-words', authenticateToken, professorController.getAiWords);
// Update AI concerning words (add, edit, delete)
router.post('/ai-words', authenticateToken, professorController.updateAiWords);

module.exports = router;
