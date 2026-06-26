import { Request, Response } from "express";
import mongoose from "mongoose";
import Group from "../../models/Group";
import Test from "../../models/Test";
import { getUserId } from "../../utils/getUserId";

interface Answer {
  questionIndex: number;
  answer: string;
}

interface SubmitBody {
  answers: Answer[];
}

export const submitGroupResult = async (
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

  const groupTest = group.tests.find(
    (t) => t._id.toString() === req.params.testId,
  );
  if (!groupTest) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const alreadyPassed = groupTest.results.some(
    (r) => r.user?.toString() === userId,
  );
  if (alreadyPassed) {
    res.status(400).json({ message: "Вы уже проходили этот тест" });
    return;
  }

  const test = await Test.findById(groupTest.test);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const { answers } = req.body as SubmitBody;
  let correctCount = 0;
  answers.forEach((a) => {
    const question = test.question[a.questionIndex];
    if (question && question.correctAnswer === a.answer) {
      correctCount++;
    }
  });

  groupTest.results.push({
    user: userId as unknown as mongoose.Types.ObjectId,
    score: correctCount,
    total: test.question.length,
    answers,
    completedAt: new Date(),
  });
  await group.save();

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

  const group = await Group.findById(req.params.id)
    .populate("tests.test", "title")
    .populate("tests.results.user", "username avatar");

  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }

  const isModeratorOrAdmin =
    group.admin.toString() === userId ||
    group.moderators.some((id: any) => id.toString() === userId);

  if (!isModeratorOrAdmin) {
    res.status(403).json({ message: "Нет прав" });
    return;
  }

  res.json(group.tests);
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
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }

  const groupTest = group.tests.find(
    (t) => t._id.toString() === req.params.testId,
  );
  if (!groupTest) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const test = await Test.findById(groupTest.test);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }

  const results = groupTest.results;

  const questionStats = test.question.map((q, idx) => {
    const total = results.filter((r) =>
      r.answers?.some((a) => a.questionIndex === idx),
    ).length;
    const correct = results.filter((r) => {
      const answer = r.answers?.find((a) => a.questionIndex === idx);
      return answer && answer.answer === q.correctAnswer;
    }).length;
    return {
      question: q.question,
      total,
      correct,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  const distribution = [0, 0, 0, 0, 0];
  results.forEach((r) => {
    const rScore = r.score ?? 0;
    const rTotal = r.total ?? 1;
    const percentage = rTotal > 0 ? (rScore / rTotal) * 100 : 0;
    if (percentage <= 20) distribution[0]++;
    else if (percentage <= 40) distribution[1]++;
    else if (percentage <= 60) distribution[2]++;
    else if (percentage <= 80) distribution[3]++;
    else distribution[4]++;
  });

  const scores: number[] = results
    .map((r) => r.score ?? 0)
    .filter((s) => !isNaN(s));
  const avgScore = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) /
      100
    : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  res.json({
    questionStats,
    distribution,
    avgScore,
    bestScore,
    totalPassed: results.length,
    totalQuestions: test.question.length,
  });
};
