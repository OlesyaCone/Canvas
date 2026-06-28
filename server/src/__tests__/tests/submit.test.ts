import { Request, Response } from "express";
import Test from "../../models/Test";
import UserModel from "../../models/User";
import { submitTest } from "../../controllers/tests/submit";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Test");
jest.mock("../../models/User");
jest.mock("../../utils/getUserId");

function mockReq(body: object = {}, params: object = {}): Request {
  return { body, params } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("submitTest", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await submitTest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("тест не найден — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Test.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await submitTest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("все ответы правильные", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const testMock = {
      _id: "t1",
      question: [
        { question: "q1", correctAnswer: "a" },
        { question: "q2", correctAnswer: "b" },
      ],
      users: [] as any[],
      passes: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Test.findById as jest.Mock).mockResolvedValue(testMock);

    const req = mockReq(
      {
        answers: [
          { questionIndex: 0, answer: "a" },
          { questionIndex: 1, answer: "b" },
        ],
      },
      { id: "t1" },
    );
    const res = mockRes();

    await submitTest(req, res);

    expect(testMock.users.length).toBe(1);
    expect(testMock.passes).toBe(1);
    expect(res.json).toHaveBeenCalledWith({ score: 2, total: 2 });
  });

  test("часть ответов неправильные", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const testMock = {
      _id: "t1",
      question: [
        { question: "q1", correctAnswer: "a" },
        { question: "q2", correctAnswer: "b" },
        { question: "q3", correctAnswer: "c" },
      ],
      users: [] as any[],
      passes: 0,
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Test.findById as jest.Mock).mockResolvedValue(testMock);

    const req = mockReq(
      {
        answers: [
          { questionIndex: 0, answer: "a" },
          { questionIndex: 1, answer: "wrong" },
          { questionIndex: 2, answer: "c" },
        ],
      },
      { id: "t1" },
    );
    const res = mockRes();

    await submitTest(req, res);

    expect(res.json).toHaveBeenCalledWith({ score: 2, total: 3 });
  });

  test("повторное прохождение — пользователь не дублируется в users", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const existingUserId = {
      equals: jest.fn().mockReturnValue(true),
    };

    const testMock = {
      _id: "t1",
      question: [{ question: "q1", correctAnswer: "a" }],
      users: [existingUserId],
      passes: 5,
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Test.findById as jest.Mock).mockResolvedValue(testMock);

    const req = mockReq({ answers: [{ questionIndex: 0, answer: "a" }] }, { id: "t1" });
    const res = mockRes();

    await submitTest(req, res);

    expect(testMock.users.length).toBe(1);
    expect(testMock.passes).toBe(6);
    expect(res.json).toHaveBeenCalledWith({ score: 1, total: 1 });
  });
});
