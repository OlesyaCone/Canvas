import { Request, Response } from "express";
import Test from "../../models/Test";
import User from "../../models/User";
import { getUserId } from "../../utils/getUserId";
import { emitNotification } from "../../services/socket";

export const toggleReaction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const { type } = req.body;
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const existing = (test.reactions as any[]).find(
    (r) => r.user?.toString() === userId,
  );
  if (existing) {
    if (existing.type === type) {
      (test.reactions as any) = (test.reactions as any[]).filter(
        (r) => r.user?.toString() !== userId,
      );
      (test as any)[type + "s"]--;
    } else {
      const oldType = existing.type;
      existing.type = type;
      (test as any)[type + "s"]++;
      (test as any)[oldType + "s"]--;
    }
  } else {
    (test.reactions as any).push({ user: userId, type });
    (test as any)[type + "s"]++;
  }
  await test.save();

  if (test?.author && test.author.toString() !== userId) {
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
