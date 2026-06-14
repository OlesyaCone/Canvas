import { Request, Response } from "express";
import Comment from "../../models/social/Comment";
import Test from "../../models/tests/Test";
import { getUserId } from "../../utils/getUserId";
import { createNotification } from "../../services/mail";

export const getComments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const comments = await Comment.find({ test: req.params.id })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 });
  res.json(comments);
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
  const comment = await Comment.create({
    user: userId,
    test: req.params.id,
    text,
  });
  await comment.populate("user", "username avatar");

  const test = await Test.findById(req.params.id);
  if (test && test.author?.toString() !== userId) {
    await createNotification(
      test.author!.toString(),
      "comment",
      `Новый комментарий к тесту "${test.title}"`,
      userId,
      `/tests/${test._id}`,
    );
  }

  res.status(201).json(comment);
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

  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    res.status(404).json({ message: "Комментарий не найден" });
    return;
  }
  if (comment.user.toString() !== userId) {
    res.status(403).json({ message: "Нет прав" });
    return;
  }

  await Comment.deleteOne({ _id: comment._id });
  res.json({ message: "Комментарий удалён" });
};
