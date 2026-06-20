import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const chunkText = async (cleanText, metadata = {}) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,           // ~700–1000 words (characters ≈ 4x words)
    chunkOverlap: 150,         // 100-word overlap (≈150 characters)
    separators: ['\n\n', '\n', '. ', ' ', '']
  });

  const docs = await splitter.createDocuments([cleanText], [metadata]);
  // Map to simple objects with pageContent and metadata
  return docs.map(doc => ({
    content: doc.pageContent,
    metadata: doc.metadata
  }));
};