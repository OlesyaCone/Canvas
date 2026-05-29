import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Test from "../models/Test";
import UserModel from "../models/User";
import mongoose from "mongoose";

const getUserId = (req: Request): string | null => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
};

export const getMyTests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const tests = await Test.find({ author: userId })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });
  res.json(tests);
};

export const getPassedTests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const tests = await Test.find({ users: userId })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });
  res.json(tests);
};

export const createTest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }

  const { title, description, questions } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const img = files?.img?.[0]
    ? `/uploads/tests/${files.img[0].filename}`
    : req.body.img || "";

  let parsedQuestions =
    typeof questions === "string" ? JSON.parse(questions) : questions;

  const questionImgs = files?.questionImgs || [];
  const indexes = Array.isArray(req.body.questionImgIndexes)
    ? req.body.questionImgIndexes
    : req.body.questionImgIndexes
      ? [req.body.questionImgIndexes]
      : [];

  questionImgs.forEach((file, i) => {
    const idx = parseInt(indexes[i], 10);
    if (!isNaN(idx) && parsedQuestions[idx]) {
      parsedQuestions[idx].img = `/uploads/tests/${file.filename}`;
    }
  });

  const test = await Test.create({
    title,
    img,
    description,
    author: userId,
    question: parsedQuestions,
  });

  await UserModel.findByIdAndUpdate(userId, {
    $push: { myTests: test._id },
  });

  res.status(201).json(test);
};

export const getTestById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const test = await Test.findById(req.params.id).populate(
    "author",
    "username avatar",
  );
  if (!test) {
    res.status(404).json({ message: "Тест не найден" });
    return;
  }
  res.json(test);
};

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
    if (question && question.correctAnswer === a.answer) {
      correctCount++;
    }
  });

  if (!test.users.some((id) => id.toString() === userId)) {
    test.users.push(new mongoose.Types.ObjectId(userId));
    await test.save();
  }

  await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { passedTests: test._id },
  });

  res.json({
    score: correctCount,
    total: test.question.length,
  });
};
