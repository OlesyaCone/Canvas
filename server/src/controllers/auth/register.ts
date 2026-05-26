import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../../models/User';
import { sendVerificationEmail } from '../../services/mail';
import { generateAccessToken, generateRefreshToken } from './generation';
import PendingUser from '../../models/PendingUser';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ message: 'Все поля обязательны' });
      return;
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      res.status(400).json({ message: 'Email или имя занято' });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await PendingUser.create({ email, username, password, verificationToken });
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Проверьте почту' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email и пароль обязательны' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Неверный email или пароль' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: 'Подтвердите email перед входом' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Неверный email или пароль' });
      return;
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.json({
      accessToken,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};