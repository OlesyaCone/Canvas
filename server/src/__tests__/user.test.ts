import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import Test from "../models/Test";
import {
  getProfile,
  getProfileStats,
  getUserProfile,
  updateProfile,
} from "../controllers/user";

jest.mock("jsonwebtoken");
jest.mock("../models/User");
jest.mock("../models/Test");
jest.mock("fs");

function mockReq(
  headers: object = {},
  params: object = {},
  body: object = {},
  file?: object,
): Request {
  const req = { headers, params, body, file } as unknown as Request;
  return req;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("getProfile", function () {
  test("нет токена — 401", async function () {
    const req = mockReq({ authorization: "" });
    const res = mockRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("пользователь не найден — 404", async function () {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({ authorization: "Bearer token" });
    const res = mockRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное получение", async function () {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (UserModel.findById as jest.Mock).mockResolvedValue({
      _id: { toString: () => "user1" },
      email: "a@a.com",
      username: "aaa",
      avatar: "",
    });

    const req = mockReq({ authorization: "Bearer token" });
    const res = mockRes();

    await getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({
      user: { id: "user1", email: "a@a.com", username: "aaa", avatar: "" },
    });
  });
});

describe("getProfileStats", function () {
  test("успешное получение", async function () {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (UserModel.findById as jest.Mock).mockResolvedValue({
      _id: { toString: () => "user1" },
      email: "a@a.com",
      username: "aaa",
      avatar: "",
      createdAt: new Date(),
      passedTests: ["t1", "t2"],
      groups: ["g1"],
    });
    (Test.countDocuments as jest.Mock).mockResolvedValue(3);

    const sortMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue([{ _id: "t1" }]);
    const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
    const findMock = { select: selectMock };
    sortMock.mockReturnValue({ limit: limitMock });
    (Test.find as jest.Mock).mockReturnValue(findMock);

    const req = mockReq({ authorization: "Bearer token" });
    const res = mockRes();

    await getProfileStats(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: { testsCreated: 3, testsPassed: 2, groupsCount: 1 },
      }),
    );
  });
});

describe("getUserProfile", function () {
  test("пользователь не найден — 404", async function () {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({}, { userId: "user2" });
    const res = mockRes();

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное получение чужого профиля", async function () {
    (UserModel.findById as jest.Mock).mockResolvedValue({
      _id: { toString: () => "user2" },
      email: "b@b.com",
      username: "bbb",
      avatar: "",
      createdAt: new Date(),
      passedTests: [],
      groups: [],
    });
    (Test.countDocuments as jest.Mock).mockResolvedValue(1);

    const sortMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockResolvedValue([]);
    const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
    const findMock = { select: selectMock };
    sortMock.mockReturnValue({ limit: limitMock });
    (Test.find as jest.Mock).mockReturnValue(findMock);

    const req = mockReq({}, { userId: "user2" });
    const res = mockRes();

    await getUserProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ _id: "user2" }),
      }),
    );
  });
});

describe("updateProfile", function () {
  test("нет токена — 401", async function () {
    const req = mockReq({ authorization: "" });
    const res = mockRes();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешное обновление", async function () {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (UserModel.findById as jest.Mock).mockResolvedValue({
      _id: { toString: () => "user1" },
      avatar: "",
    });
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
      _id: { toString: () => "user1" },
      email: "a@a.com",
      username: "newName",
      avatar: "/uploads/avatars/new.jpg",
    });

    const req = mockReq(
      { authorization: "Bearer token" },
      {},
      { username: "newName", avatar: "/uploads/avatars/new.jpg" },
    );
    const res = mockRes();

    await updateProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: "user1",
        email: "a@a.com",
        username: "newName",
        avatar: "/uploads/avatars/new.jpg",
      },
    });
  });
});
