import { Request, Response } from "express";
import Group from "../../models/Group";
import Test from "../../models/Test";
import { submitGroupResult, getGroupResults, getTestStats } from "../../controllers/groups/results";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Group");
jest.mock("../../models/Test");
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

const createPopulateChain = (result: any) => {
  const populate2 = jest.fn().mockResolvedValue(result);

  const populate1 = jest.fn().mockReturnValue({
    populate: populate2,
  });

  return {
    populate: populate1,
  };
};

describe("submitGroupResult", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);
    const req = mockReq();
    const res = mockRes();
    await submitGroupResult(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("группа не найдена — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Group.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({}, { id: "g1", testId: "t1" });
    const res = mockRes();
    await submitGroupResult(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("уже проходил — 400", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    const groupMock = {
      tests: [
        {
          _id: { toString: () => "t1" },
          results: [{ user: { toString: () => "user1" } }],
        },
      ],
    };
    (Group.findById as jest.Mock).mockResolvedValue(groupMock);

    const req = mockReq({}, { id: "g1", testId: "t1" });
    const res = mockRes();
    await submitGroupResult(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("успешная отправка", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    const groupMock = {
      tests: [
        {
          _id: { toString: () => "t1" },
          test: "test1",
          results: [] as any[],
        },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };
    (Group.findById as jest.Mock).mockResolvedValue(groupMock);
    (Test.findById as jest.Mock).mockResolvedValue({
      _id: "test1",
      question: [
        { question: "q1", correctAnswer: "a" },
        { question: "q2", correctAnswer: "b" },
      ],
    });

    const req = mockReq(
      {
        answers: [
          { questionIndex: 0, answer: "a" },
          { questionIndex: 1, answer: "c" },
        ],
      },
      { id: "g1", testId: "t1" },
    );
    const res = mockRes();
    await submitGroupResult(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Результат сохранён" }),
    );
  });
});

describe("getGroupResults", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);
    const req = mockReq();
    const res = mockRes();
    await getGroupResults(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("нет прав — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user3");

    const chain = createPopulateChain({
      admin: { toString: () => "admin" },
      moderators: [{ toString: () => "user2" }],
    });

    (Group.findById as jest.Mock).mockReturnValue(chain);

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();
    await getGroupResults(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("успешное получение", async function () {
    (getUserId as jest.Mock).mockReturnValue("admin");

    const chain = createPopulateChain({
      admin: { toString: () => "admin" },
      moderators: [],
      tests: [{ _id: "t1" }],
    });

    (Group.findById as jest.Mock).mockReturnValue(chain);

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();

    await getGroupResults(req, res);

    expect(res.json).toHaveBeenCalled();
  });
});

describe("getTestStats", function () {
  test("успешная статистика", async function () {
    (getUserId as jest.Mock).mockReturnValue("admin");

    const groupMock = {
      tests: [
        {
          _id: { toString: () => "t1" },
          test: "test1",
          results: [
            {
              user: "user1",
              score: 2,
              total: 2,
              answers: [
                { questionIndex: 0, answer: "a" },
                { questionIndex: 1, answer: "b" },
              ],
            },
            {
              user: "user2",
              score: 1,
              total: 2,
              answers: [
                { questionIndex: 0, answer: "a" },
                { questionIndex: 1, answer: "c" },
              ],
            },
          ],
        },
      ],
    };

    (Group.findById as jest.Mock).mockResolvedValue(groupMock);
    (Test.findById as jest.Mock).mockResolvedValue({
      _id: "test1",
      question: [
        { question: "q1", correctAnswer: "a" },
        { question: "q2", correctAnswer: "b" },
      ],
    });

    const req = mockReq({}, { id: "g1", testId: "t1" });
    const res = mockRes();
    await getTestStats(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ totalPassed: 2 }));
  });
});
