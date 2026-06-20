/**
 * Compile the knowledge context from syllabus, textbook, PYQ texts.
 * This simulates Gemini's context cache. We store the string in MongoDB.
 */
export const compileContextCache = (syllabusText, textbookText, pyqText) => {
  const parts = [];

  if (syllabusText) {
    parts.push('=== SYLLABUS ===\n' + syllabusText);
  }
  if (textbookText) {
    // For a real system you might only take important sections.
    // Here we include a truncated but representative chunk.
    const truncated = textbookText.slice(0, 10000); // first 10k chars
    parts.push('=== TEXTBOOK SUMMARY ===\n' + truncated);
  }
  if (pyqText) {
    // Similarly, analyse PYQs (frequency of topics, mark distribution)
    // We'll just store the raw text as a reference.
    const truncated = pyqText.slice(0, 8000);
    parts.push('=== PREVIOUS YEAR QUESTIONS ===\n' + truncated);
  }

  // Additional analysis could be done here.
  return parts.join('\n\n');
};