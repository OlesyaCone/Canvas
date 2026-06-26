import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import PendingUser from "../../models/PendingUser";
import { refresh, logout, verifyEmail } from "../../controllers/auth/tokens";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../controllers/auth/generation";

jest.mock("jsonwebtoken");
jest.mock("../../models/User");
jest.mock("../../models/PendingUser");
jest.mock("../../controllers/auth/generation");

function mockReq(cookies: object = {}, params: object = {}): Request {
  return { cookies, params } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("refresh", function () {
  test("нет refreshToken — 400", async function () {
    const req = mockReq({});
    const res = mockRes();

    await refresh(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("успешное обновление", async function () {
    const userMock = {
      _id: "1",
      refreshToken: "old_token",
      save: jest.fn().mockResolvedValue(undefined),
    };

    (jwt.verify as jest.Mock).mockReturnValue({ id: "1" });
    (User.findById as jest.Mock).mockResolvedValue(userMock);
    (generateAccessToken as jest.Mock).mockReturnValue("new_access");
    (generateRefreshToken as jest.Mock).mockReturnValue("new_refresh");

    const req = mockReq({ refreshToken: "old_token" });
    const res = mockRes();

    await refresh(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ accessToken: "new_access" });
  });
});

describe("logout", function () {
  test("успешный выход", async function () {
    const userMock = {
      refreshToken: "token",
      save: jest.fn().mockResolvedValue(undefined),
    };

    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = mockReq({ refreshToken: "token" });
    const res = mockRes();

    await logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.json).toHaveBeenCalledWith({ message: "Выход выполнен" });
  });

  test("без токена — всё равно выход", async function () {
    const req = mockReq({});
    const res = mockRes();

    await logout(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Выход выполнен" });
  });
});

describe("verifyEmail", function () {
  test("неверный токен — 400", async function () {
    (PendingUser.findOne as jest.Mock).mockResolvedValue(null);

    const req = mockReq({}, { token: "bad" });
    const res = mockRes();

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("успешное подтверждение", async function () {
    (PendingUser.findOne as jest.Mock).mockResolvedValue({
      _id: "p1",
      email: "a@a.com",
      username: "aaa",
      password: "123456",
    });

    const userMock = {
      _id: "u1",
      email: "a@a.com",
      username: "aaa",
      save: jest.fn().mockResolvedValue(undefined),
    };

    (User.create as jest.Mock).mockResolvedValue(userMock);
    (PendingUser.deleteOne as jest.Mock).mockResolvedValue({});
    (generateAccessToken as jest.Mock).mockReturnValue("acc");
    (generateRefreshToken as jest.Mock).mockReturnValue("ref");

    const req = mockReq({}, { token: "valid" });
    const res = mockRes();

    await verifyEmail(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: "Email подтверждён",
      accessToken: "acc",
      user: { id: "u1", email: "a@a.com", username: "aaa" },
    });
  });
});
