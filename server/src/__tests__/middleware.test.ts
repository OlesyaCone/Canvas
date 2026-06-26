import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { protect } from "../middleware/auth";

jest.mock("jsonwebtoken");
jest.mock("../models/User");

function mockReq(headers: object = {}): Request {
  return { headers } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("protect middleware", function () {
  test("без заголовка Authorization — 401", async function () {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("заголовок не Bearer — 401", async function () {
    const req = mockReq({ authorization: "Basic token" });
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("токен невалидный — 401", async function () {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid");
    });

    const req = mockReq({ authorization: "Bearer bad_token" });
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("пользователь не найден — 401", async function () {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (User.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({ authorization: "Bearer valid_token" });
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("валидный токен — вызывает next и добавляет user", async function () {
    process.env.JWT_ACCESS_SECRET = "secret123";
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });
    (User.findById as jest.Mock).mockResolvedValue({
      _id: "user1",
      email: "a@a.com",
    });

    const req = mockReq({ authorization: "Bearer valid_token" });
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await protect(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeDefined();
    expect((req as any).user._id).toBe("user1");
  });
});
