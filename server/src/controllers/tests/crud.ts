import { Request, Response } from "express";
import Test from "../../models/Test";
import UserModel from "../../models/User";
import { getUserId } from "../../utils/getUserId";
import fs from "fs";
import path from "path";

export const createTest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Не авторизован" });
    return;
  }
  const { title, description, questions, visibility } = req.body;
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
    if (!isNaN(idx) && parsedQuestions[idx])
      parsedQuestions[idx].img = `/uploads/tests/${file.filename}`;
  });
  const test = await Test.create({
    title,
    img,
    description,
    author: userId,
    question: parsedQuestions,
    visibility: visibility || "private",
  });
  await UserModel.findByIdAndUpdate(userId, { $push: { myTests: test._id } });
  res.status(201).json(test);
};

export const updateTest = async (
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
  if (test.author?.toString() !== userId) {
    res.status(403).json({ message: "Нет прав" });
    return;
  }
  const { title, description, questions } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const img = files?.img?.[0]
    ? `/uploads/tests/${files.img[0].filename}`
    : req.body.img || test.img;
  let parsedQuestions =
    typeof questions === "string"
      ? JSON.parse(questions)
      : questions || test.question;
  const questionImgs = files?.questionImgs || [];
  const indexes = Array.isArray(req.body.questionImgIndexes)
    ? req.body.questionImgIndexes
    : req.body.questionImgIndexes
      ? [req.body.questionImgIndexes]
      : [];
  questionImgs.forEach((file, i) => {
    const idx = parseInt(indexes[i], 10);
    if (!isNaN(idx) && parsedQuestions[idx])
      parsedQuestions[idx].img = `/uploads/tests/${file.filename}`;
  });
  const updated = await Test.findByIdAndUpdate(
    req.params.id,
    { title, img, description, question: parsedQuestions },
    { new: true },
  );
  res.json(updated);
};

export const deleteTest = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ message: "Не авторизован" }); return; }
  const test = await Test.findById(req.params.id);
  if (!test) { res.status(404).json({ message: "Тест не найден" }); return; }
  if (test.author?.toString() !== userId) { res.status(403).json({ message: "Нет прав" }); return; }

  if (test.img?.startsWith("/uploads/tests/")) {
    const imgPath = path.join(__dirname, "..", "..", "..", test.img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  test.question.forEach((q) => {
    if (q.img?.startsWith("/uploads/tests/")) {
      const qImgPath = path.join(__dirname, "..", "..", "..", q.img);
      if (fs.existsSync(qImgPath)) fs.unlinkSync(qImgPath);
    }
  });

  await Test.findByIdAndDelete(req.params.id);
  await UserModel.findByIdAndUpdate(userId, { $pull: { myTests: req.params.id } });
  res.json({ message: "Тест удалён" });
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
