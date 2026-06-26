import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../controllers/auth/generation";

jest.mock("jsonwebtoken");

test("generateAccessToken — вызывает jwt.sign с правильными параметрами", function () {
  process.env.JWT_ACCESS_SECRET = "secret123";
  const signSpy = jest.spyOn(jwt, "sign").mockReturnValue("fake_token" as any);
  const token = generateAccessToken("user1");

  expect(signSpy).toHaveBeenCalledWith({ id: "user1" }, "secret123", {
    expiresIn: "15m",
  });
  expect(token).toBe("fake_token");
});

test("generateRefreshToken — вызывает jwt.sign с expiresIn 7d", function () {
  process.env.JWT_REFRESH_SECRET = "refresh_secret";
  const signSpy = jest
    .spyOn(jwt, "sign")
    .mockReturnValue("fake_refresh" as any);

  const token = generateRefreshToken("user1");

  expect(signSpy).toHaveBeenCalledWith({ id: "user1" }, "refresh_secret", {
    expiresIn: "7d",
  });
  expect(token).toBe("fake_refresh");
});
