import { Request, Response } from "express";
import Test from "../../models/Test";
import UserModel from "../../models/User";
import { createTest, updateTest, deleteTest, getTestById } from "../../controllers/tests/crud";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Test");
jest.mock("../../models/User");
jest.mock("../../utils/getUserId");
jest.mock("fs");
jest.mock("path");

function mockReq(body: object = {}, params: object = {}, files?: object): Request {
  return { body, params, files } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("createTest", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await createTest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешное создание", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Test.create as jest.Mock).mockResolvedValue({ _id: "t1", title: "test" });
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const req = mockReq({
      title: "test",
      description: "desc",
      questions: JSON.stringify([{ question: "q1", answers: ["a", "b"], correctAnswer: "a" }]),
      visibility: "public",
    });
    const res = mockRes();

    await createTest(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(Test.create).toHaveBeenCalledWith(expect.objectContaining({ title: "test" }));
  });
});

describe("updateTest", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await updateTest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("тест не найден — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Test.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await updateTest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("не автор — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user2");
    (Test.findById as jest.Mock).mockResolvedValue({
      author: { toString: () => "user1" },
    });

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await updateTest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("успешное обновление", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Test.findById as jest.Mock).mockResolvedValue({
      author: { toString: () => "user1" },
      img: "",
      question: [],
    });
    (Test.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: "t1",
      title: "updated",
    });

    const req = mockReq({ title: "updated", questions: "[]" }, { id: "t1" });
    const res = mockRes();

    await updateTest(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: "updated" }));
  });
});

describe("deleteTest", function () {
  test("не автор — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user2");
    (Test.findById as jest.Mock).mockResolvedValue({
      author: { toString: () => "user1" },
    });

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await deleteTest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("успешное удаление", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Test.findById as jest.Mock).mockResolvedValue({
      _id: "t1",
      author: { toString: () => "user1" },
      img: null,
      question: [],
    });
    (Test.findByIdAndDelete as jest.Mock).mockResolvedValue({});
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await deleteTest(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Тест удалён" });
  });
});

describe("getTestById", function () {
  test("тест не найден — 404", async function () {
    (Test.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await getTestById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное получение", async function () {
    (Test.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({ _id: "t1", title: "test" }),
    });

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await getTestById(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: "t1" }));
  });
});
