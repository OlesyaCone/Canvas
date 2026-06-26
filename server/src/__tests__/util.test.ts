import { Request } from "express";
import jwt from "jsonwebtoken";
import { getUserId } from "../utils/getUserId";

jest.mock("jsonwebtoken");

function mockReq(headers: object = {}): Request {
  return { headers } as unknown as Request;
}

describe("getUserId", function () {
  test("без заголовка — null", function () {
    const req = mockReq();
    expect(getUserId(req)).toBeNull();
  });

  test("без Bearer — null", function () {
    const req = mockReq({ authorization: "Basic token" });
    expect(getUserId(req)).toBeNull();
  });

  test("токен невалидный — null", function () {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("invalid");
    });

    const req = mockReq({ authorization: "Bearer bad" });
    expect(getUserId(req)).toBeNull();
  });

  test("валидный токен — возвращает id", function () {
    process.env.JWT_ACCESS_SECRET = "secret";
    (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });

    const req = mockReq({ authorization: "Bearer valid" });
    expect(getUserId(req)).toBe("user1");
  });
});
