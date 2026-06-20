import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';  // works with Node ESM
import fs from 'fs/promises';

export const extractTextFromPDF = async (filePath) => {
  // Read file as Uint8Array
  const data = new Uint8Array(await fs.readFile(filePath));

  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = '';

  // Loop through each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const cleanText = (rawText) => {
  return rawText
    .replace(/\bPage\s+\d+\b/g, '')
    .replace(/^\s*\d+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
};