import { Request, Response } from "express";
import Test from "../../models/Test";
import User from "../../models/User";
import { toggleReaction } from "../../controllers/social/reactions";
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

describe("toggleReaction", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await toggleReaction(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("тест не найден — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Test.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({ type: "like" }, { id: "t1" });
    const res = mockRes();

    await toggleReaction(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("новая реакция — like", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (emitNotification as jest.Mock).mockReturnValue(undefined);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const testMock = {
      _id: "t1",
      title: "test",
      likes: 0,
      dislikes: 0,
      author: { toString: () => "author1" },
      reactions: [] as any[],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Test.findById as jest.Mock).mockResolvedValue(testMock);

    const req = mockReq({ type: "like" }, { id: "t1" });
    const res = mockRes();

    await toggleReaction(req, res);

    expect(testMock.reactions.length).toBe(1);
    expect(testMock.reactions[0].type).toBe("like");
    expect(testMock.likes).toBe(1);
    expect(res.json).toHaveBeenCalledWith(testMock);
  });

  test("повторная реакция — удаление", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const testMock = {
      _id: "t1",
      title: "test",
      likes: 1,
      dislikes: 0,
      author: { toString: () => "author1" },
      reactions: [
        {
          _id: "r1",
          user: { toString: () => "user1" },
          type: "like",
        },
      ],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Test.findById as jest.Mock).mockResolvedValue(testMock);

    const req = mockReq({ type: "like" }, { id: "t1" });
    const res = mockRes();

    await toggleReaction(req, res);

    expect(testMock.reactions.length).toBe(0);
    expect(testMock.likes).toBe(0);
  });

  test("смена реакции — like на dislike", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const reaction = {
      _id: "r1",
      user: { toString: () => "user1" },
      type: "like",
    };

    const testMock = {
      _id: "t1",
      title: "test",
      likes: 1,
      dislikes: 0,
      author: { toString: () => "author1" },
      reactions: [reaction],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Test.findById as jest.Mock).mockResolvedValue(testMock);

    const req = mockReq({ type: "dislike" }, { id: "t1" });
    const res = mockRes();

    await toggleReaction(req, res);

    expect(reaction.type).toBe("dislike");
    expect(testMock.likes).toBe(0);
    expect(testMock.dislikes).toBe(1);
  });
});
