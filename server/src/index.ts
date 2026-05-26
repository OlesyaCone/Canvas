import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/index';
import { getFile } from './controllers/upload';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/uploads/:path(*)', getFile);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('MongoDB подключена'))
  .catch((err) => {
    console.error('Ошибка MongoDB:', err.message);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});