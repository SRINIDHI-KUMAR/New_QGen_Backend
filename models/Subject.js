import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectName: { type: String, required: true },   // no unique here
  faissIndexPath: { type: String, required: true },
  contextCache: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

// One subject per user per name
subjectSchema.index({ userId: 1, subjectName: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);