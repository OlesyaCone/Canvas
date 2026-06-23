import { Request, Response } from "express";
import Group from "../../models/Group";
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
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404).json({ message: "Группа не найдена" });
    return;
  }
  const groupTest = group.tests.find(
    (t: any) => t._id.toString() === req.params.testId,
  );
  if (!groupTest) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  if (groupTest.results.some((r: any) => r.user?.toString() === userId)) {
    res.status(400).json({ message: "Вы уже проходили этот тест" });
    return;
  }
  const test = await Test.findById(groupTest.test);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  const { answers } = req.body;
  let correctCount = 0;
  answers.forEach((a: { questionIndex: number; answer: string }) => {
    const question = test.question[a.questionIndex];
    if (question && question.correctAnswer === a.answer) correctCount++;
  });
  groupTest.results.push({
    user: userId as any,
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
  if (
    group.admin.toString() !== userId &&
    !group.moderators.some((id: any) => id.toString() === userId)
  ) {
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
    (t: any) => t._id.toString() === req.params.testId,
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
  const questionStats = test.question.map((q: any, idx: number) => {
    const total = results.filter((r: any) =>
      r.answers?.some((a: any) => a.questionIndex === idx),
    ).length;
    const correct = results.filter((r: any) => {
      const answer = r.answers?.find((a: any) => a.questionIndex === idx);
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
  results.forEach((r: any) => {
    const p = (r.total || 0) > 0 ? ((r.score || 0) / (r.total || 1)) * 100 : 0;
    if (p <= 20) distribution[0]++;
    else if (p <= 40) distribution[1]++;
    else if (p <= 60) distribution[2]++;
    else if (p <= 80) distribution[3]++;
    else distribution[4]++;
  });
  const scores = results
    .map((r: any) => r.score || 0)
    .filter((s: number) => !isNaN(s));
  res.json({
    questionStats,
    distribution,
    avgScore: scores.length
      ? Math.round(
          (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) *
            100,
        ) / 100
      : 0,
    bestScore: scores.length ? Math.max(...scores) : 0,
    totalPassed: results.length,
    totalQuestions: test.question.length,
  });
};
