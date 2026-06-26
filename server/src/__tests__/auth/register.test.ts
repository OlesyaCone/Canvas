import { Request, Response } from "express";
import { register, login } from "../../controllers/auth/register";
import User from "../../models/User";
import PendingUser from "../../models/PendingUser";
import { sendVerificationEmail } from "../../services/mail";

jest.mock("../../models/User");
jest.mock("../../models/PendingUser");
jest.mock("../../services/mail");

function mockReq(body: object): Request {
  return { body } as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("register", function () {
  test("успешная регистрация", async function () {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (PendingUser.create as jest.Mock).mockResolvedValue({});
    (sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

    const req = mockReq({
      email: "a@a.com",
      username: "aaa",
      password: "123456",
    });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(sendVerificationEmail).toHaveBeenCalled();
  });

  test("нет email — 400", async function () {
    const req = mockReq({ username: "aaa", password: "123456" });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("email уже занят — 400", async function () {
    (User.findOne as jest.Mock).mockResolvedValue({ _id: "1" });

    const req = mockReq({
      email: "a@a.com",
      username: "aaa",
      password: "123456",
    });
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("login", function () {
  test("пустые поля — 400", async function () {
    const req = mockReq({});
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("пользователь не найден — 401", async function () {
    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq({ email: "a@a.com", password: "123456" });
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
