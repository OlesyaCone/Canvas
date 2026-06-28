import { Request, Response } from "express";
import mongoose from "mongoose";
import Test from "../../models/Test";
import User from "../../models/User";
import { getUserId } from "../../utils/getUserId";
import { emitNotification } from "../../services/socket";

export const toggleReaction = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const { type } = req.body as { type: "like" | "dislike" };
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const existing = test.reactions.find((r) => r.user?.toString() === userId);

  if (existing) {
    if (existing.type === type) {
      if (existing._id) {
        test.reactions = test.reactions.filter(
          (r) => r._id?.toString() !== existing._id.toString(),
        ) as typeof test.reactions;
      }
      if (type === "like") test.likes--;
      else test.dislikes--;
    } else {
      const oldType = existing.type;
      existing.type = type;
      if (type === "like") test.likes++;
      else test.dislikes++;
      if (oldType === "like") test.likes--;
      else test.dislikes--;
    }
  } else {
    test.reactions.push({
      user: userId as unknown as mongoose.Types.ObjectId,
      type,
      createdAt: new Date(),
    });
    if (type === "like") test.likes++;
    else test.dislikes++;
  }

  await test.save();

  if (test.author && test.author.toString() !== userId) {
    await User.findByIdAndUpdate(test.author, {
      $push: {
        notifications: {
          from: userId,
          type: type,
          text: `Новая реакция на тест "${test.title}"`,
          link: `/tests/${test._id}`,
          read: false,
          createdAt: new Date(),
        },
      },
    });
    emitNotification(test.author.toString(), {
      type,
      text: `Новая реакция на тест "${test.title}"`,
    });
  }
  res.json(test);
};
