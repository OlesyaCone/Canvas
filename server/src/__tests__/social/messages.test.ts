import { Request, Response } from "express";
import Group from "../../models/Group";
import { getMessages } from "../../controllers/social/messages";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Group");
jest.mock("../../utils/getUserId");

function mockReq(params: object = {}): Request {
  return { params } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("getMessages", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("группа не найдена — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq({ id: "g1" });
    const res = mockRes();

    await getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное получение", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const messages = [{ _id: "m1", text: "hello", user: { _id: "u1", username: "aaa" } }];

    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({ messages }),
    });

    const req = mockReq({ id: "g1" });
    const res = mockRes();

    await getMessages(req, res);

    expect(res.json).toHaveBeenCalledWith(messages);
  });
});
