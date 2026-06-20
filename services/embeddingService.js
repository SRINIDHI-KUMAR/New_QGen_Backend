import axios from 'axios';

const OPENROUTER_BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const API_KEY = process.env.OPENROUTER_API_KEY;
const EMBED_MODEL = process.env.OPENROUTER_EMBED_MODEL;

export const createEmbedding = async (text) => {
  const response = await axios.post(
    `${OPENROUTER_BASE}/embeddings`,
    { model: EMBED_MODEL, input: text },
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );
  return response.data.data[0].embedding;
};

export const embedDocuments = async (texts) => {
  const response = await axios.post(
    `${OPENROUTER_BASE}/embeddings`,
    { model: EMBED_MODEL, input: texts },
    { headers: { Authorization: `Bearer ${API_KEY}` } }
  );
  return response.data.data.map(item => item.embedding);
};