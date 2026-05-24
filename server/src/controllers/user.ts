import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Нет токена" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };
    const username = req.body.username;
    const avatar = req.file 
      ? `/uploads/avatars/${req.file.filename}` 
      : req.body.avatar;

    const user = await UserModel.findByIdAndUpdate(
      decoded.id,
      { username, avatar },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
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
    res.status(500).json({ message: "Ошибка сервера" });
  }
};