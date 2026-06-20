import { Router } from 'express';
import { generatePaper } from '../services/paperService.js';
import GeneratedPaper from '../models/GeneratedPaper.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// POST /generate-paper – protected
router.post('/generate-paper', verifyToken, async (req, res) => {
  try {
    const { subject, difficulty } = req.body;
    if (!subject || !difficulty) {
      return res.status(400).json({ error: 'subject and difficulty are required' });
    }

    // The ownership check is done inside the service now,
    // but we can still verify quickly (optional)
    const paper = await generatePaper(req.userId, subject, difficulty);

    res.json({ paper });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Generation failed', details: err.message });
  }
});

// GET /papers – protected, user's own papers
router.get('/papers', verifyToken, async (req, res) => {
  const papers = await GeneratedPaper.find({ userId: req.userId })
    .sort({ generatedAt: -1 })
    .limit(10);
  res.json(papers);
});

export default router;