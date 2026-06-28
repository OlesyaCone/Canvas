import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import Test from "../models/Test";
import fs from "fs";
import path from "path";

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Нет токена" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };
    const username = req.body.username;
    const currentUser = await UserModel.findById(decoded.id);
    if (req.file && currentUser?.avatar?.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), currentUser.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : req.body.avatar;
    const user = await UserModel.findByIdAndUpdate(decoded.id, { username, avatar }, { new: true });
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

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Нет токена" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };
    const user = await UserModel.findById(decoded.id);
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

export const getProfileStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Нет токена" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }
    const testsCreated = await Test.countDocuments({ author: decoded.id });
    const testsPassed = user.passedTests?.length || 0;
    const groupsCount = user.groups?.length || 0;
    const publicTests = await Test.find({
      author: decoded.id,
      visibility: "public",
    })
      .select("title img likes dislikes passes question")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      stats: { testsCreated, testsPassed, groupsCount },
      publicTests,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    const testsCreated = await Test.countDocuments({ author: userId });
    const testsPassed = user.passedTests?.length || 0;
    const groupsCount = user.groups?.length || 0;
    const publicTests = await Test.find({
      author: userId,
      visibility: "public",
    })
      .select("title img likes dislikes passes question")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      stats: { testsCreated, testsPassed, groupsCount },
      publicTests,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
