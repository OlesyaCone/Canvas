import { Request, Response } from "express";
import Test from "../../models/Test";
import { getMyTests, getPassedTests } from "../../controllers/tests/my";
import { getUserId } from "../../utils/getUserId";

jest.mock("../../models/Test");
jest.mock("../../utils/getUserId");

function mockRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("getMyTests", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = {} as Request;
    const res = mockRes();

    await getMyTests(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешное получение", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const sortMock = jest.fn().mockResolvedValue([{ _id: "t1" }]);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    (Test.find as jest.Mock).mockReturnValue({ populate: populateMock });

    const req = {} as Request;
    const res = mockRes();

    await getMyTests(req, res);

    expect(res.json).toHaveBeenCalledWith([{ _id: "t1" }]);
  });
});

describe("getPassedTests", function () {
  test("не авторизован — 401", async function () {
    (getUserId as jest.Mock).mockReturnValue(null);

    const req = {} as Request;
    const res = mockRes();

    await getPassedTests(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("успешное получение", async function () {
    (getUserId as jest.Mock).mockReturnValue("user1");

    const sortMock = jest.fn().mockResolvedValue([{ _id: "t2" }]);
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
    (Test.find as jest.Mock).mockReturnValue({ populate: populateMock });

    const req = {} as Request;
    const res = mockRes();

    await getPassedTests(req, res);

    expect(res.json).toHaveBeenCalledWith([{ _id: "t2" }]);
  });
});
