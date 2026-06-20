import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import uploadRoutes from './routes/upload.js';
import generateRoutes from './routes/generate.js';
import subjectRoutes from './routes/subject.js';

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', uploadRoutes);
app.use('/api', generateRoutes);
app.use('/api', subjectRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();