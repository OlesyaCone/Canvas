import { Request, Response } from "express";
import Notification from "../../models/social/Notification";
import { getUserId } from "../../utils/getUserId";

export const getNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  const notifications = await Notification.find({ user: userId })
    .populate("from", "username avatar")
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(notifications);
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  await Notification.updateMany({ user: userId, read: false }, { read: true });
  res.json({ message: "Отмечено прочитанным" });
};
