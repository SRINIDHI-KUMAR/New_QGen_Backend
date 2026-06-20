import { Router } from 'express';
import { generatePaper } from '../services/paperService.js';
import GeneratedPaper from '../models/GeneratedPaper.js';

const router = Router();

// POST /generate-paper
router.post('/generate-paper', async (req, res) => {
  try {
    const { subject, difficulty } = req.body;
    if (!subject || !difficulty) {
      return res.status(400).json({ error: 'subject and difficulty are required' });
    }
    const paper = await generatePaper(subject, difficulty);
    res.json({ paper });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Generation failed', details: err.message });
  }
});

// routes/generate.js (or subject.js)
router.get('/papers', async (req, res) => {
  const papers = await GeneratedPaper.find().sort({ generatedAt: -1 }).limit(10);
  res.json(papers);
});

export default router;