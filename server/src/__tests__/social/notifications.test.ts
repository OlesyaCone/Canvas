import { Request, Response } from "express";
import User from "../../models/User";
import {
  getNotifications,
  markRead,
} from "../../controllers/social/notifications";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/User");
jest.mock("../../utils/getUserId");

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("getNotifications", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = {} as Request;
    const res = mockRes();

    await getNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("пользователь не найден — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (User.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = {} as Request;
    const res = mockRes();

    await getNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное получение", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const notifications = [
      { _id: "n1", text: "new", createdAt: new Date("2025-01-02") },
      { _id: "n2", text: "old", createdAt: new Date("2025-01-01") },
    ];

    (User.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({ notifications }),
    });

    const req = {} as Request;
    const res = mockRes();

    await getNotifications(req, res);

    expect(res.json).toHaveBeenCalledWith([notifications[0], notifications[1]]);
  });
});

describe("markRead", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = {} as Request;
    const res = mockRes();

    await markRead(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешная отметка", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (User.updateOne as jest.Mock).mockResolvedValue({});

    const req = {} as Request;
    const res = mockRes();

    await markRead(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Отмечено прочитанным" });
  });
});
