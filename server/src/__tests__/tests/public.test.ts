import { Request, Response } from "express";
import Test from "../../models/Test";
import { getPublicTests } from "../../controllers/tests/public";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Test");
jest.mock("../../utils/getUserId");

function mockReq(query: object = {}): Request {
  return { query } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("getPublicTests", function () {
  test("без авторизации — отдаёт тесты", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const testMock = {
      _id: "t1",
      title: "test",
      visibility: "public",
      comments: [],
      reactions: [],
      toObject: function () {
        return {
          _id: "t1",
          title: "test",
          visibility: "public",
          myReaction: null,
          commentsCount: 0,
        };
      },
    };

    const sortMock = jest.fn().mockResolvedValue([testMock]);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    (Test.find as jest.Mock).mockReturnValue({ populate: populateMock });

    const req = mockReq();
    const res = mockRes();

    await getPublicTests(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: "t1",
      }),
    ]);
  });

  test("с авторизацией — добавляет myReaction", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const testMock = {
      _id: "t1",
      title: "test",
      visibility: "public",
      comments: [],
      reactions: [{ user: { toString: () => "user1" }, type: "like" }],
      toObject: function () {
        return {
          _id: "t1",
          title: "test",
          visibility: "public",
          myReaction: "like",
          commentsCount: 0,
        };
      },
    };

    const sortMock = jest.fn().mockResolvedValue([testMock]);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    (Test.find as jest.Mock).mockReturnValue({ populate: populateMock });

    const req = mockReq();
    const res = mockRes();

    await getPublicTests(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: "t1",
        myReaction: "like",
      }),
    ]);
  });
});
