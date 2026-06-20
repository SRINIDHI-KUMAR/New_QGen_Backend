import { Router } from 'express';
import Subject from '../models/Subject.js';

const router = Router();

// GET /subjects – list all subjects
router.get('/subjects', async (req, res) => {
  const subjects = await Subject.find({}, 'subjectName createdAt');
  res.json(subjects);
});

// GET /subjects/:name – get subject details
router.get('/subjects/:name', async (req, res) => {
  const subject = await Subject.findOne({ subjectName: req.params.name });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject);
});

export default router;