import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
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

// Routes
app.use('/api', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', generateRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  
  // Drop old unique index if it exists
  try {
    await mongoose.connection.db.collection('subjects').dropIndex('subjectName_1');
    console.log('Old index subjectName_1 dropped');
  } catch (e) {
    console.log('Old index not found (this is OK)');
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();