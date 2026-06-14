import { Request, Response } from "express";
import Message from "../../models/social/Message";
import { getUserId } from "../../utils/getUserId";

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const messages = await Message.find({ group: req.params.id })
    .populate("user", "username avatar")
    .sort({ createdAt: 1 })
    .limit(50);
  res.json(messages);
};