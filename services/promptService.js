/**
 * Build the generation prompt using the subject's context cache and FAISS chunks.
 */
export const buildPrompt = (contextCache, relevantChunks, difficulty) => {
  const chunkText = relevantChunks.map(c => c.content).join('\n\n---\n\n');

  const systemPrompt = `
You are an expert question paper setter for university exams.
Below is the complete knowledge context for the subject, including syllabus, textbook excerpts and previous year questions.
Use this context to generate a question paper that matches the required format, difficulty, and avoids duplicate questions.

KNOWLEDGE CONTEXT:
${contextCache}

ADDITIONAL RELEVANT TOPICS FROM VECTOR SEARCH:
${chunkText}
`;

  const userPrompt = `Generate a question paper with the following structure:

Part A – 10 questions, each 2 marks (short answer type).
Part B – 5 questions, each 13 marks (long answer type, covering different units).

Overall difficulty: ${difficulty}
Ensure questions are diverse, cover different units, and do not repeat.
Output only the question paper, no extra text. Format as:

PART A
1. ...
2. ...
...

PART B
11. ...
12. ...
...
`;

  return { systemPrompt, userPrompt };
};