import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { embedDocuments, createEmbedding } from './embeddingService.js';
import path from 'path';
import fs from 'fs/promises';

// Custom embeddings class to bridge OpenRouter into LangChain FAISS
class OpenRouterEmbeddings {
  async embedDocuments(texts) {
    return embedDocuments(texts);
  }
  async embedQuery(text) {
    return createEmbedding(text);
  }
}

/**
 * Create and save a FAISS index from chunks
 * @param {Array} chunks - [{content, metadata}]
 * @param {string} indexDir - directory to save the FAISS index
 * @returns {FaissStore}
 */
export const createAndSaveFAISS = async (chunks, indexDir) => {
  // Ensure directory exists
  await fs.mkdir(indexDir, { recursive: true });

  const docs = chunks.map(c => ({
    pageContent: c.content,
    metadata: c.metadata
  }));

  const embeddings = new OpenRouterEmbeddings();
  const vectorStore = await FaissStore.fromDocuments(docs, embeddings);
  await vectorStore.save(indexDir);
  return vectorStore;
};

/**
 * Load an existing FAISS index
 * @param {string} indexDir
 * @returns {FaissStore}
 */
export const loadFAISS = async (indexDir) => {
  const embeddings = new OpenRouterEmbeddings();
  return FaissStore.load(indexDir, embeddings);
};

/**
 * Perform similarity search on a loaded store
 * @param {FaissStore} store
 * @param {string} query
 * @param {number} k
 * @returns {Array} - [{pageContent, metadata, score}]
 */
export const searchFAISS = async (store, query, k = 15) => {
  const results = await store.similaritySearchWithScore(query, k);
  return results.map(([doc, score]) => ({
    content: doc.pageContent,
    metadata: doc.metadata,
    score
  }));
};