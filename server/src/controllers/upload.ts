import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?._id?.toString() || 'unknown';
    const ext = path.extname(file.originalname);
    const name = `${userId}-${Date.now()}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Можно загружать только изображения'));
  }
};


export const upload = multer({
  storage,
  fileFilter,
});


export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Файл не загружен' });
      return;
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    res.json({ url: avatarUrl });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка загрузки' });
  }
};