import mongoose from 'mongoose';

const generatedPaperSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  paper: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('GeneratedPaper', generatedPaperSchema);