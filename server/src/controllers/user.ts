import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Нет токена' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };
    const username = req.body.username;
    
    let newAvatarPath: string | undefined;
    if (req.file) {
      newAvatarPath = `/uploads/avatars/${req.file.filename}`;
    } else if (req.body.avatar) {
      newAvatarPath = req.body.avatar;
    }

    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    if (req.file && currentUser.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
      const oldFilePath = path.join(__dirname, '..', '..', currentUser.avatar);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log('Старый аватар удалён:', oldFilePath);
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.id,
      { username, avatar: newAvatarPath },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json({
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Нет токена' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};