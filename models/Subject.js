import { Router } from 'express';
import Subject from '../models/Subject.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// GET /subjects – protected
router.get('/subjects', verifyToken, async (req, res) => {
  try {
    const subjects = await Subject.find(
      { userId: req.userId },
      'subjectName createdAt'
    );
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /subjects/:subjectName – single subject detail
router.get('/subjects/:subjectName', verifyToken, async (req, res) => {
  try {
    const subject = await Subject.findOne({
      userId: req.userId,
      subjectName: req.params.subjectName,
    });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

export default router;