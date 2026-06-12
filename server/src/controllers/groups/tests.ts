import { Request, Response } from "express";
import Group from "../../models/groups/Group";
import GroupTest from "../../models/groups/GroupTest";
import Test from "../../models/tests/Test";
import { getUserId } from "../../utils/getUserId";
import { sendTestAssignedEmail } from "../../services/mail";

export const assignTest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  const group = await Group.findById(req.params.id).populate<{
    members: { email: string; username: string }[];
  }>("members", "email username");
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  if (
    group.admin.toString() !== userId &&
    !group.moderators.some((id) => id.toString() === userId)
  ) {
    res.status(403).json({ message: "Нет прав" });
    return;
  }

  const { testId, deadline } = req.body;
  const test = await Test.findById(testId);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const groupTest = await GroupTest.create({
    group: group._id,
    test: testId,
    deadline: deadline || null,
    assignedBy: userId,
  });

  const testLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/groups/${group._id}`;
  for (const member of group.members) {
    try {
      await sendTestAssignedEmail(
        member.email,
        member.username,
        group.name,
        test.title || "",
        testLink,
        deadline || "",
      );
    } catch (e) {
      console.error(`Ошибка отправки письма для ${member.email}:`, e);
    }
  }

  res.status(201).json(groupTest);
};

export const getGroupTests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  if (!group.members.some((id) => id.toString() === userId)) {
    res.status(403).json({ message: "Вы не участник группы" });
    return;
  }

  const tests = await GroupTest.find({ group: group._id })
    .populate("test")
    .populate("assignedBy", "username avatar")
    .sort({ createdAt: -1 });
  res.json(tests);
};
