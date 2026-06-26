import { Request, Response } from "express";
import Test from "../../models/Test";
import User from "../../models/User";
import {
  getComments,
  addComment,
  deleteComment,
} from "../../controllers/social/comments";
import { getUserId } from "../../utils/getUserId";
import { emitNotification } from "../../services/socket";

jest.mock("../../models/Test");
jest.mock("../../models/User");
jest.mock("../../utils/getUserId");
jest.mock("../../services/socket");

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

describe("getComments", function () {
  test("тест не найден — 404", async function () {
    const chain = { populate: jest.fn().mockResolvedValue(null) };
    (Test.findById as jest.Mock).mockReturnValue(chain);

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await getComments(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное получение", async function () {
    const comments = [
      { _id: "c1", text: "hello", user: { _id: "u1", username: "aaa" } },
    ];

    const chain = { populate: jest.fn().mockResolvedValue({ comments }) };
    (Test.findById as jest.Mock).mockReturnValue(chain);

    const req = mockReq({}, { id: "t1" });
    const res = mockRes();

    await getComments(req, res);

    expect(res.json).toHaveBeenCalledWith(comments);
  });
});

describe("addComment", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("тест не найден — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Test.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({ text: "hello" }, { id: "t1" });
    const res = mockRes();

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное добавление", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (emitNotification as jest.Mock).mockReturnValue(undefined);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const testMock = {
      _id: "t1",
      title: "test",
      author: { toString: () => "author1" },
      comments: [] as any[],
      save: jest.fn().mockResolvedValue(undefined),
    };

    const populatedMock = {
      comments: [
        {
          _id: "c1",
          text: "hello",
          user: { _id: "user1", username: "aaa", avatar: "" },
        },
      ],
    };

    (Test.findById as jest.Mock)
      .mockResolvedValueOnce(testMock)
      .mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(populatedMock),
      });

    const req = mockReq({ text: "hello" }, { id: "t1" });
    const res = mockRes();

    await addComment(req, res);

    expect(testMock.comments.length).toBe(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ text: "hello" }),
    );
  });
});

describe("deleteComment", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешное удаление", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const testMock = {
      comments: [
        { _id: { toString: () => "c1" } },
        { _id: { toString: () => "c2" } },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Test.findById as jest.Mock).mockResolvedValue(testMock);

    const req = mockReq({}, { id: "t1", commentId: "c1" });
    const res = mockRes();

    await deleteComment(req, res);

    expect(testMock.comments.length).toBe(1);
    expect(res.json).toHaveBeenCalledWith({ message: "Удалено" });
  });
});
