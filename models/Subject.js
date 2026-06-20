import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true, unique: true },
  faissIndexPath: { type: String, required: true },   // e.g., /vectorstore/dbms
  contextCache: { type: String, required: true },     // compiled context text
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }                           // optional TTL
});

export default mongoose.model('Subject', subjectSchema);