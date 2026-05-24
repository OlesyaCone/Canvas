import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('MongoDB подключена'))
  .catch((err) => {
    console.error('Ошибка MongoDB:', err.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});