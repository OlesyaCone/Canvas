import { Request, Response } from "express";
import Group from "../../models/Group";
import Test from "../../models/Test";
import User from "../../models/User";
import { getUserId } from "../../utils/getUserId";
import { emitNotification } from "../../services/socket";
import { sendTestAssignedEmail, createNotification } from "../../services/mail";

export const assignTest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const group = await Group.findById(req.params.id).populate(
    "members",
    "_id email username",
  );
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
  group.tests.push({
    test: testId,
    deadline: deadline || null,
    assignedBy: userId,
    results: [],
  });
  await group.save();
  const testLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/groups/${group._id}`;
  for (const member of group.members) {
    try {
      await sendTestAssignedEmail(
        (member as any).email,
        (member as any).username,
        group.name,
        test.title || "",
        testLink,
        deadline || "",
      );
      await User.findByIdAndUpdate(member._id, {
        $push: {
          notifications: {
            from: userId,
            type: "test_assigned",
            text: `Назначен тест "${test.title}" в группе "${group.name}"`,
            link: testLink,
            read: false,
            createdAt: new Date(),
          },
        },
      });
      emitNotification(member._id.toString(), {
        type: "test_assigned",
        text: `Назначен тест "${test.title}"`,
      });
    } catch (e) {}
  }
  res.status(201).json(group.tests[group.tests.length - 1]);
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
  const group = await Group.findById(req.params.id).populate("tests.test");
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  if (!group.members.some((id) => id.toString() === userId)) {
    res.status(403).json({ message: "Вы не участник группы" });
    return;
  }
  res.json(group.tests);
};
