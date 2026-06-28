import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MulterRequest extends Request {
  user?: { _id?: { toString(): string } };
}

const createStorage = (subfolder: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(__dirname, "..", "..", "uploads", subfolder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const multerReq = req as MulterRequest;
      const userId = multerReq.user?._id?.toString() || "unknown";
      const ext = path.extname(file.originalname);
      const uniqueSuffix = crypto.randomBytes(8).toString("hex");
      const name = `${userId}-${Date.now()}-${uniqueSuffix}${ext}`;
      cb(null, name);
    },
  });

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Можно загружать только изображения"));
  }
};

export const upload = multer({
  storage: createStorage("avatars"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
export const uploadTestImage = multer({
  storage: createStorage("tests"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 },
});
export const uploadGroupAvatar = multer({
  storage: createStorage("groups"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      req.params.path,
    );
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "Файл не найден" });
      return;
    }
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки файла" });
  }
};

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
