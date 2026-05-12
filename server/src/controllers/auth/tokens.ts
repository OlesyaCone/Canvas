import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { generateAccessToken, generateRefreshToken } from './generation';

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token обязателен' });
      return;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: 'Невалидный refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Невалидный refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ refreshToken: req.body.refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    res.json({ message: 'Выход выполнен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};