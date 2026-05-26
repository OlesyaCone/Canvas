import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  const dir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
  console.log('Сохраняю файл в:', dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  cb(null, dir);
},
  filename: (req, file, cb) => {
    const userId = (req as any).user?._id?.toString() || "unknown";
    const ext = path.extname(file.originalname);
    const name = `${userId}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Можно загружать только изображения"));
  }
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = path.join(__dirname, '..', '..', 'uploads', req.url.replace('/uploads/', ''));
    console.log('getFile path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('Файл не найден');
      res.status(404).json({ message: 'Файл не найден' });
      return;
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Ошибка в getFile:', error);
    res.status(500).json({ message: 'Ошибка загрузки файла' });
  }
};

export const upload = multer({ storage, fileFilter });

export const uploadAvatar = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Файл не загружен" });
      return;
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    res.json({ url: avatarUrl });
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки" });
  }
};
