import axios from 'axios';
import Subject from '../models/Subject.js';
import GeneratedPaper from '../models/GeneratedPaper.js';
import { loadFAISS, searchFAISS } from './faissService.js';
import { buildPrompt } from './promptService.js';

const OPENROUTER_BASE = process.env.OPENROUTER_BASE_URL;
const API_KEY = process.env.OPENROUTER_API_KEY;
const GEN_MODEL = process.env.OPENROUTER_GEN_MODEL;

export const generatePaper = async (subjectName, difficulty) => {
  // 1. Retrieve subject metadata
  const subject = await Subject.findOne({ subjectName });
  if (!subject) throw new Error('Subject not found. Please upload materials first.');

  // 2. Load FAISS and retrieve relevant chunks
  const vectorStore = await loadFAISS(subject.faissIndexPath);
  const relevantChunks = await searchFAISS(vectorStore, `${subjectName} important topics`, 15);

  // 3. Build prompts
  const { systemPrompt, userPrompt } = buildPrompt(
    subject.contextCache,
    relevantChunks,
    difficulty
  );

  // 4. Call OpenRouter chat completion (simulating context cache by including full context in system prompt)
  const response = await axios.post(
    `${OPENROUTER_BASE}/chat/completions`,
    {
      model: GEN_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    },
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );

  const paper = response.data.choices[0].message.content;

  // 5. Save generated paper
  const generated = new GeneratedPaper({
    subject: subjectName,
    difficulty,
    paper,
    generatedAt: new Date()
  });
  await generated.save();

  return paper;
};