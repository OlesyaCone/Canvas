import { Request, Response } from "express";
import Group from "../../models/Group";
import GroupTest from "../../models/GroupTest";
import Test from "../../models/Test";
import { getUserId } from "../../utils/getUserId";

export const assignTest = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const group = await Group.findById(req.params.id);
  if (!group) { res.status(404).json({ message: "Группа не найдена" }); return; }
  if (group.admin.toString() !== userId && !group.moderators.some(id => id.toString() === userId)) {
    res.status(403).json({ message: "Нет прав" }); return;
  }

  const { testId, deadline } = req.body;
  const test = await Test.findById(testId);
  if (!test) { res.status(404).json({ message: "Тест не найден" }); return; }

  const groupTest = await GroupTest.create({
    group: group._id,
    test: testId,
    deadline: deadline || null,
    assignedBy: userId,
  });

  res.status(201).json(groupTest);
};

export const getGroupTests = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }

  const group = await Group.findById(req.params.id);
  if (!group) { res.status(404).json({ message: "Группа не найдена" }); return; }
  if (!group.members.some(id => id.toString() === userId)) {
    res.status(403).json({ message: "Вы не участник группы" }); return;
  }

  const tests = await GroupTest.find({ group: group._id })
    .populate("test")
    .populate("assignedBy", "username avatar")
    .sort({ createdAt: -1 });
  res.json(tests);
};