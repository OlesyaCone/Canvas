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

  const test = await Test.findById(testId);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const groupTest = await GroupTest.findById(groupTestId);
  if (!groupTest) {
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

export const getTestStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  const groupTest = await GroupTest.findById(req.params.testId).populate(
    "test",
  );
  if (!groupTest) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const test = groupTest.test as any;
  const results = groupTest.results;

  const questionStats = test.question.map((q: any, idx: number) => {
    const totalAnswers = results.filter((r: any) =>
      r.answers?.some((a: any) => a.questionIndex === idx),
    ).length;
    const correctAnswers = results.filter((r: any) => {
      const answer = r.answers?.find((a: any) => a.questionIndex === idx);
      return answer && answer.answer === q.correctAnswer;
    }).length;
    return {
      question: q.question,
      total: totalAnswers,
      correct: correctAnswers,
      percentage:
        totalAnswers > 0
          ? Math.round((correctAnswers / totalAnswers) * 100)
          : 0,
    };
  });

  const distribution = [0, 0, 0, 0, 0];
  results.forEach((r: any) => {
    const percent = r.total > 0 ? (r.score / r.total) * 100 : 0;
    if (percent <= 20) distribution[0]++;
    else if (percent <= 40) distribution[1]++;
    else if (percent <= 60) distribution[2]++;
    else if (percent <= 80) distribution[3]++;
    else distribution[4]++;
  });

  const scores = results.map((r: any) => r.score);
  const avgScore =
    scores.length > 0
      ? Math.round(
          (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) *
            100,
        ) / 100
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const totalPassed = results.length;

  res.json({
    questionStats,
    distribution,
    avgScore,
    bestScore,
    totalPassed,
    totalQuestions: test.question.length,
  });
};
