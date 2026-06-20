import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import { extractTextFromPDF, cleanText } from '../services/pdfService.js';
import { chunkText } from '../services/chunkService.js';
import { createAndSaveFAISS } from '../services/faissService.js';
import { compileContextCache } from '../services/cacheService.js';
import Subject from '../models/Subject.js';
import path from 'path';
import { verifyToken } from '../middlewares/auth.js';
const router = Router();

// POST /subjects/upload – protected
router.post(
  '/subjects/upload',
  verifyToken,
  upload.fields([
    { name: 'syllabus', maxCount: 1 },
    { name: 'textbook', maxCount: 1 },
    { name: 'pyqs', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { subjectName } = req.body;
      if (!subjectName) return res.status(400).json({ error: 'subjectName required' });

      const syllabusText = req.files.syllabus ? cleanText(await extractTextFromPDF(req.files.syllabus[0].path)) : '';
      const textbookText = req.files.textbook ? cleanText(await extractTextFromPDF(req.files.textbook[0].path)) : '';
      const pyqText = req.files.pyqs ? cleanText(await extractTextFromPDF(req.files.pyqs[0].path)) : '';

      const allChunks = [];
      if (syllabusText) {
        const syllabusChunks = await chunkText(syllabusText, { subject: subjectName, source: 'syllabus' });
        allChunks.push(...syllabusChunks);
      }
      if (textbookText) {
        const textbookChunks = await chunkText(textbookText, { subject: subjectName, source: 'textbook' });
        allChunks.push(...textbookChunks);
      }
      if (pyqText) {
        const pyqChunks = await chunkText(pyqText, { subject: subjectName, source: 'pyqs' });
        allChunks.push(...pyqChunks);
      }

      const userId = req.userId; // from token
      const safeSubject = subjectName.toLowerCase().replace(/\s+/g, '_');
      const faissDir = path.join(process.cwd(), 'vectorstore', `${userId}_${safeSubject}`);
      await createAndSaveFAISS(allChunks, faissDir);

      const contextCache = compileContextCache(syllabusText, textbookText, pyqText);

      const existing = await Subject.findOne({ subjectName, userId });
      if (existing) {
        existing.faissIndexPath = faissDir;
        existing.contextCache = contextCache;
        existing.createdAt = new Date();
        await existing.save();
      } else {
        await Subject.create({
          userId,
          subjectName,
          faissIndexPath: faissDir,
          contextCache
        });
      }

      res.json({ message: 'Subject uploaded and processed successfully', subjectName });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Processing failed', details: err.message });
    }
  }
);

// GET /subjects – protected
router.get('/subjects', verifyToken, async (req, res) => {
  const subjects = await Subject.find({ userId: req.userId }, 'subjectName createdAt');
  res.json(subjects);
});

export default router;