import { Request, Response } from "express";
import mongoose from "mongoose";
import Group from "../../models/Group";
import GroupTest from "../../models/GroupTest";
import Test from "../../models/Test";
import { getUserId } from "../../utils/getUserId";

export const submitGroupResult = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  const groupTestId = req.params.id;
  const testId = req.params.testId;
  const { answers } = req.body;

  console.log("groupTestId:", groupTestId);
  console.log("testId:", testId);

  const test = await Test.findById(testId);
  if (!test) {
    console.log("Тест не найден");
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const groupTest = await GroupTest.findById(groupTestId);
  if (!groupTest) {
    console.log("GroupTest не найден по _id:", groupTestId);
    res.status(404).json({ message: "Назначенный тест не найден" });
    return;
  }

  let correctCount = 0;
  answers.forEach((a: { questionIndex: number; answer: string }) => {
    const question = test.question[a.questionIndex];
    if (question && question.correctAnswer === a.answer) correctCount++;
  });

  const alreadySubmitted = groupTest.results.some(
    (r) => r.user?.toString() === userId,
  );
  if (alreadySubmitted) {
    res.status(400).json({ message: "Вы уже проходили этот тест" });
    return;
  }

  groupTest.results.push({
    user: new mongoose.Types.ObjectId(userId),
    score: correctCount,
    total: test.question.length,
    answers,
    completedAt: new Date(),
  });
  await groupTest.save();

  console.log("Результат сохранён");
  res.json({
    message: "Результат сохранён",
    score: correctCount,
    total: test.question.length,
  });
};

export const getGroupResults = async (
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
  if (
    group.admin.toString() !== userId &&
    !group.moderators.some((id) => id.toString() === userId)
  ) {
    res.status(403).json({ message: "Нет прав" });
    return;
  }

  const results = await GroupTest.find({ group: group._id })
    .populate("test", "title")
    .populate("results.user", "username avatar")
    .sort({ createdAt: -1 });
  res.json(results);
};
