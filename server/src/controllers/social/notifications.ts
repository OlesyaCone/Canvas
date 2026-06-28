import { Request, Response } from "express";
import User from "../../models/User";
import { getUserId } from "../../utils/getUserId";

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const user = await User.findById(userId).populate("notifications.from", "username avatar");
  if (!user) {
    res.status(404).json({ message: "Пользователь не найден" });
    return;
  }
  res.json(
    user.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 20),
  );
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  await User.updateOne({ _id: userId }, { $set: { "notifications.$[].read": true } });
  res.json({ message: "Отмечено прочитанным" });
};
