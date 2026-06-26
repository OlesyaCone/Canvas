import { Request, Response } from "express";
import Group from "../../models/Group";
import Test from "../../models/Test";
import User from "../../models/User";
import { assignTest, getGroupTests } from "../../controllers/groups/tests";
import { getUserId } from "../../utils/getUserId";
import { emitNotification } from "../../services/socket";
import { sendTestAssignedEmail } from "../../services/mail";

jest.mock("../../models/Group");
jest.mock("../../models/Test");
jest.mock("../../models/User");
jest.mock("../../utils/getUserId");
jest.mock("../../services/socket");
jest.mock("../../services/mail");

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

describe("assignTest", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await assignTest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("группа не найдена — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();

    await assignTest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("нет прав — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user3");

    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        admin: { toString: () => "admin" },
        moderators: [{ toString: () => "user2" }],
      }),
    });

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();

    await assignTest(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("тест не найден — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("admin");

    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        admin: { toString: () => "admin" },
        moderators: [],
        members: [],
        tests: [],
        save: jest.fn(),
      }),
    });
    (Test.findById as jest.Mock).mockResolvedValue(null);

    const req = mockReq({ testId: "t1" }, { id: "g1" });
    const res = mockRes();

    await assignTest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное назначение теста", async function () {
    (getUserId as jest.Mock).mockReturnValue("admin");
    (sendTestAssignedEmail as jest.Mock).mockResolvedValue(undefined);
    (emitNotification as jest.Mock).mockReturnValue(undefined);
    (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const groupMock = {
      _id: "g1",
      name: "test group",
      admin: { toString: () => "admin" },
      moderators: [],
      members: [{ _id: "user1", email: "a@a.com", username: "aaa" }],
      tests: [] as any[],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(groupMock),
    });
    (Test.findById as jest.Mock).mockResolvedValue({
      _id: "t1",
      title: "test title",
    });

    const req = mockReq({ testId: "t1", deadline: "2025-12-31" }, { id: "g1" });
    const res = mockRes();

    await assignTest(req, res);

    expect(groupMock.tests.length).toBe(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(sendTestAssignedEmail).toHaveBeenCalled();
    expect(emitNotification).toHaveBeenCalled();
  });
});

describe("getGroupTests", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await getGroupTests(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("не участник — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user3");

    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        members: [{ toString: () => "user1" }, { toString: () => "user2" }],
      }),
    });

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();

    await getGroupTests(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("успешное получение", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    (Group.findById as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        members: [{ toString: () => "user1" }],
        tests: [{ _id: "t1" }, { _id: "t2" }],
      }),
    });

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();

    await getGroupTests(req, res);

    expect(res.json).toHaveBeenCalledWith([{ _id: "t1" }, { _id: "t2" }]);
  });
});
