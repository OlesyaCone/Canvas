import { Request, Response } from "express";
import Group from "../../models/Group";
import UserModel from "../../models/User";
import {
  createGroup,
  getGroup,
  getMyGroups,
  updateGroup,
  deleteGroup,
} from "../../controllers/groups/crud";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Group");
jest.mock("../../models/User");
jest.mock("../../utils/getUserId");

function mockReq(body: object = {}, params: object = {}, file?: object): Request {
  const req = { body, params, file } as unknown as Request;
  return req;
}

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const createPopulateChain = (result: any) => {
  const populate3 = jest.fn().mockResolvedValue(result);

  const populate2 = jest.fn().mockReturnValue({
    populate: populate3,
  });

  const populate1 = jest.fn().mockReturnValue({
    populate: populate2,
  });

  return {
    populate: populate1,
  };
};

describe("createGroup", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);
    const req = mockReq();
    const res = mockRes();
    await createGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешное создание группы", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    (Group.create as jest.Mock).mockResolvedValue({ _id: "g1" });
    (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

    const req = mockReq({ name: "test", description: "desc" });
    const res = mockRes();
    await createGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("getGroup", function () {
  test("группа не найдена — 404", async function () {
    const chain = createPopulateChain(null);
    (Group.findById as jest.Mock).mockReturnValue(chain);

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();
    await getGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("успешное получение группы", async function () {
    const chain = createPopulateChain({
      _id: "g1",
      name: "test",
    });

    (Group.findById as jest.Mock).mockReturnValue(chain);

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();
    await getGroup(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: "g1" }));
  });
});

describe("getMyGroups", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);
    const req = mockReq();
    const res = mockRes();
    await getMyGroups(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешное получение групп", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");
    const sortMock = jest.fn().mockResolvedValue([{ _id: "g1" }]);
    (Group.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({ sort: sortMock }),
    });

    const req = mockReq();
    const res = mockRes();
    await getMyGroups(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});

describe("updateGroup", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);
    const req = mockReq();
    const res = mockRes();
    await updateGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("не админ — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user2");
    (Group.findById as jest.Mock).mockResolvedValue({
      admin: { toString: () => "user1" },
    });

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();
    await updateGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("deleteGroup", function () {
  test("не админ — 403", async function () {
    (getUserId as jest.Mock).mockReturnValue("user2");
    (Group.findById as jest.Mock).mockResolvedValue({
      admin: { toString: () => "user1" },
    });

    const req = mockReq({}, { id: "g1" });
    const res = mockRes();
    await deleteGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
