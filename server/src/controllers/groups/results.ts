import { Request, Response } from "express";
import Group from "../../models/Group";
import GroupTest from "../../models/GroupTest";
import { getUserId } from "../../utils/getUserId";

export const submitGroupResult = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const groupTest = await GroupTest.findById(req.params.testId);
  if (!groupTest) { res.status(404).json({ message: "Назначенный тест не найден" }); return; }

  const group = await Group.findById(groupTest.group);
  if (!group || !group.members.some(id => id.toString() === userId)) {
    res.status(403).json({ message: "Вы не участник группы" }); return;
  }

  const { score, total, answers } = req.body;
  groupTest.results.push({ user: userId as any, score, total, answers, completedAt: new Date() });
  await groupTest.save();
  res.json({ message: "Результат сохранён" });
};

export const getGroupResults = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const group = await Group.findById(req.params.id);
  if (!group) { res.status(404).json({ message: "Группа не найдена" }); return; }
  if (group.admin.toString() !== userId && !group.moderators.some(id => id.toString() === userId)) {
    res.status(403).json({ message: "Нет прав" }); return;
  }

  const results = await GroupTest.find({ group: group._id })
    .populate("test", "title")
    .populate("results.user", "username avatar")
    .sort({ createdAt: -1 });
  res.json(results);
};