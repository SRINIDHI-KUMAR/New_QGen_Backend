import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Subject from './models/Subject.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import generateRoutes from './routes/generate.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://newqgen.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', generateRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // ========= TEMPORARY – drop old unique index =========
  try {
    await mongoose.connection.db.collection('subjects').dropIndex('subjectName_1');
    console.log('Old index subjectName_1 dropped');
  } catch (e) {
    console.log('Old index not found, nothing to drop');
  }
  // New compound index will be created automatically by Mongoose
  // =====================================================

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();