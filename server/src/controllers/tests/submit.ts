import { Request, Response } from "express";
import mongoose from "mongoose";
import Test from "../../models/Test";
import UserModel from "../../models/User";
import { getUserId } from "../../utils/getUserId";

export const submitTest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const test = await Test.findById(req.params.id);
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  const { answers } = req.body as {
    answers: { questionIndex: number; answer: string }[];
  };
  let correctCount = 0;
  answers.forEach((a) => {
    const question = test.question[a.questionIndex];
    if (question && question.correctAnswer === a.answer) correctCount++;
  });
  if (!test.users.some((id) => id.toString() === userId)) {
    test.users.push(new mongoose.Types.ObjectId(userId));
  }
  test.passes = (test.passes || 0) + 1;
  await test.save();
  await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { passedTests: test._id },
  });
  res.json({ score: correctCount, total: test.question.length });
};
