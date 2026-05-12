import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken } from './generation';
import UserModel from '../../models/User'; 

export const googleAuth = (_req: Request, res: Response): void => {
  res.redirect('/api/auth/google/callback');
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as { _id: string; email: string } | undefined;

    if (!user) {
      console.log('Нет пользователя в req.user');
      res.redirect(`${process.env.CLIENT_URL}/auth/error`);
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLogin: new Date(),
    });

    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (error) {
    console.error('Ошибка в googleCallback:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth/error`);
  }
};