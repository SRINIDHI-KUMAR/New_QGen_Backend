import mongoose from 'mongoose';

const generatedPaperSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  paper: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('GeneratedPaper', generatedPaperSchema);