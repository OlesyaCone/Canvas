import { Request, Response } from "express";
import Test from "../../models/Test";
import User from "../../models/User";
import { getUserId } from "../../utils/getUserId";
import { emitNotification } from "../../services/socket";

export const getComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const test = await Test.findById(req.params.id).populate(
    "comments.user",
    "username avatar",
  );
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  res.json(test.comments);
};

export const addComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const { text } = req.body;
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  (test.comments as any).push({ user: userId, text });
  await test.save();
  const populated = await Test.findById(req.params.id).populate(
    "comments.user",
    "username avatar",
  );
  if (!populated) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  const comments = populated.comments as any[];
  res.json(comments[comments.length - 1]);

  if (test?.author && test.author.toString() !== userId) {
    await User.findByIdAndUpdate(test.author, {
      $push: {
        notifications: {
          from: userId,
          type: "comment",
          text: `Новый комментарий к тесту "${test.title}"`,
          link: `/tests/${test._id}`,
          read: false,
          createdAt: new Date(),
        },
      },
    });
    emitNotification(test.author.toString(), {
      type: "comment",
      text: `Новый комментарий к тесту "${test.title}"`,
    });
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  (test.comments as any) = (test.comments as any[]).filter(
    (c) => c._id.toString() !== req.params.commentId,
  );
  await test.save();
  res.json({ message: "Удалено" });
};
