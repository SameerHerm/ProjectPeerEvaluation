const Professor = require('../models/Professor');

// Get AI concerning words for the logged-in professor
exports.getAiWords = async (req, res, next) => {
  try {
    const professorId = req.user.id;
    const professor = await Professor.findById(professorId);
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    res.status(200).json({ words: professor.aiConcerningWords || [] });
  } catch (err) {
    next(err);
  }
};

// Update AI concerning words (add, edit, delete)
exports.updateAiWords = async (req, res, next) => {
  try {
    const professorId = req.user.id;
    const professor = await Professor.findById(professorId);
    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    const { action, word, index } = req.body;
    let words = professor.aiConcerningWords || [];
    if (action === 'add' && word) {
      words.push(word);
    } else if (action === 'edit' && typeof index === 'number' && word) {
      if (words[index] !== undefined) words[index] = word;
    } else if (action === 'delete' && typeof index === 'number') {
      if (words[index] !== undefined) words.splice(index, 1);
    }
    professor.aiConcerningWords = words;
    await professor.save();
    res.status(200).json({ words });
  } catch (err) {
    next(err);
  }
};
