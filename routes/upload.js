import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import { extractTextFromPDF, cleanText } from '../services/pdfService.js';
import { chunkText } from '../services/chunkService.js';
import { createAndSaveFAISS } from '../services/faissService.js';
import { compileContextCache } from '../services/cacheService.js';
import Subject from '../models/Subject.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /subjects/upload
router.post(
  '/subjects/upload',
  upload.fields([
    { name: 'syllabus', maxCount: 1 },
    { name: 'textbook', maxCount: 1 },
    { name: 'pyqs', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { subjectName } = req.body;
      if (!subjectName) return res.status(400).json({ error: 'subjectName required' });

      // Extract texts
      const syllabusText = req.files.syllabus ? cleanText(await extractTextFromPDF(req.files.syllabus[0].path)) : '';
      const textbookText = req.files.textbook ? cleanText(await extractTextFromPDF(req.files.textbook[0].path)) : '';
      const pyqText = req.files.pyqs ? cleanText(await extractTextFromPDF(req.files.pyqs[0].path)) : '';

      // Combine all text for chunking with metadata
      const allChunks = [];
      if (syllabusText) {
        const syllabusChunks = await chunkText(syllabusText, { subject: subjectName, source: 'syllabus' });
        allChunks.push(...syllabusChunks);
      }
      if (textbookText) {
        // For textbook, we may want to add unit metadata; here we assume units are marked in the text (e.g., "Unit 1...")
        const textbookChunks = await chunkText(textbookText, { subject: subjectName, source: 'textbook' });
        allChunks.push(...textbookChunks);
      }
      if (pyqText) {
        const pyqChunks = await chunkText(pyqText, { subject: subjectName, source: 'pyqs' });
        allChunks.push(...pyqChunks);
      }

      // Create FAISS index
      const subjectId = subjectName.toLowerCase().replace(/\s+/g, '_');
      const faissDir = path.join(process.cwd(), 'vectorstore', subjectId);
      await createAndSaveFAISS(allChunks, faissDir);

      // Compile context cache
      const contextCache = compileContextCache(syllabusText, textbookText, pyqText);

      // Save subject to MongoDB
      const existing = await Subject.findOne({ subjectName });
      if (existing) {
        // Update existing subject
        existing.faissIndexPath = faissDir;
        existing.contextCache = contextCache;
        existing.createdAt = new Date();
        await existing.save();
      } else {
        await Subject.create({
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

export default router;