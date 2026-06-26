import { Request, Response } from "express";
import Group from "../../models/Group";
import UserModel from "../../models/User";
import {
  joinGroup,
  leaveGroup,
  kickMember,
  promoteMember,
  demoteMember,
} from "../../controllers/groups/members";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Group");
jest.mock("../../models/User");
jest.mock("../../utils/getUserId");

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

describe("joinGroup", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await joinGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("группа не найдена — 404", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Group.findOne as jest.Mock).mockResolvedValue(null);

    const req = mockReq({ inviteCode: "bad" });
    const res = mockRes();

    await joinGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("уже в группе — 400", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Group.findOne as jest.Mock).mockResolvedValue({
      members: [{ toString: () => "user1" }],
    });

    const req = mockReq({ inviteCode: "code" });
    const res = mockRes();

    await joinGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("успешное вступление", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const groupMock = {
      _id: "g1",
      members: [{ toString: () => "user2" }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Group.findOne as jest.Mock).mockResolvedValue(groupMock);
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const req = mockReq({ inviteCode: "code" });
    const res = mockRes();

    await joinGroup(req, res);

    expect(groupMock.members.length).toBe(2);
    expect(res.json).toHaveBeenCalledWith(groupMock);
  });
});

describe("leaveGroup", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await leaveGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("админ не может выйти — 400", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Group.findById as jest.Mock).mockResolvedValue({
      admin: { toString: () => "user1" },
    });

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();

    await leaveGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("успешный выход", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const groupMock = {
      admin: { toString: () => "admin" },
      members: [{ toString: () => "user1" }, { toString: () => "user2" }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Group.findById as jest.Mock).mockResolvedValue(groupMock);
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();

    await leaveGroup(req, res);

    expect(groupMock.members.length).toBe(1);
    expect(res.json).toHaveBeenCalledWith({ message: "Вы покинули группу" });
  });
});

describe("kickMember", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = mockReq();
    const res = mockRes();

    await kickMember(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("не админ — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user2");
    (Group.findById as jest.Mock).mockResolvedValue({
      admin: { toString: () => "user1" },
    });

    const req = mockReq({}, { id: "g1", userId: "user3" });
    const res = mockRes();

    await kickMember(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("успешный кик", async function () {
    (getUserId as jest.Mock).mockReturnValue("admin");

    const groupMock = {
      admin: { toString: () => "admin" },
      members: [{ toString: () => "admin" }, { toString: () => "user3" }],
      moderators: [{ toString: () => "user3" }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Group.findById as jest.Mock).mockResolvedValue(groupMock);
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const req = mockReq({}, { id: "g1", userId: "user3" });
    const res = mockRes();

    await kickMember(req, res);

    expect(groupMock.members.length).toBe(1);
    expect(groupMock.moderators.length).toBe(0);
    expect(res.json).toHaveBeenCalledWith({ message: "Участник исключён" });
  });
});

describe("promoteMember", function () {
  test("успешное повышение", async function () {
    (getUserId as jest.Mock).mockReturnValue("admin");

    const groupMock = {
      admin: { toString: () => "admin" },
      members: [{ toString: () => "admin" }, { toString: () => "user3" }],
      moderators: [] as any[],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Group.findById as jest.Mock).mockResolvedValue(groupMock);

    const req = mockReq({}, { id: "g1", userId: "user3" });
    const res = mockRes();

    await promoteMember(req, res);

    expect(groupMock.moderators.length).toBe(1);
    expect(res.json).toHaveBeenCalledWith(groupMock);
  });
});

describe("demoteMember", function () {
  test("успешное понижение", async function () {
    (getUserId as jest.Mock).mockReturnValue("admin");

    const groupMock = {
      admin: { toString: () => "admin" },
      moderators: [{ toString: () => "user3" }, { toString: () => "user4" }],
      save: jest.fn().mockResolvedValue(undefined),
    };

    (Group.findById as jest.Mock).mockResolvedValue(groupMock);

    const req = mockReq({}, { id: "g1", userId: "user3" });
    const res = mockRes();

    await demoteMember(req, res);

    expect(groupMock.moderators.length).toBe(1);
    expect(res.json).toHaveBeenCalledWith(groupMock);
  });
});
