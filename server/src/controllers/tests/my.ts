import { Request, Response } from "express";
import Test from "../../models/Test";
import { getUserId } from "../../utils/getUserId";

export const getMyTests = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }
  const tests = await Test.find({ author: userId }).populate("author", "username avatar").sort({ createdAt: -1 });
  res.json(tests);
};

export const getPassedTests = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }
  const tests = await Test.find({ users: userId }).populate("author", "username avatar").sort({ createdAt: -1 });
  res.json(tests);
};