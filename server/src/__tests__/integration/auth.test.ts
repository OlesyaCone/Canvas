import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { connectTestDB, closeTestDB, clearDB } from "../helpers/db";
import { registerUser, loginUser } from "../helpers/factories";

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearDB);

describe("Auth Integration", function () {
  test("полный цикл: регистрация → подтверждение → логин → refresh → logout", async function () {
    const reg = await registerUser("a@a.com", "aaa", "123456");
    expect(reg.status).toBe(201);

    const PendingUser = mongoose.model("PendingUser");
    const pending = await PendingUser.findOne({ email: "a@a.com" });
    expect(pending).toBeDefined();

    const verify = await request(app).get(`/api/auth/verify/${pending.verificationToken}`);
    expect(verify.status).toBe(200);
    expect(verify.body.accessToken).toBeDefined();
    const accessToken = verify.body.accessToken;

    const login = await loginUser("a@a.com", "123456");
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeDefined();

    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(logout.status).toBe(200);
  });

  test("регистрация с дубликатом email", async function () {
    await registerUser("a@a.com", "aaa", "123456");
    const res = await registerUser("a@a.com", "bbb", "123456");
    expect(res.status).toBe(400);
  });

  test("логин с неверным паролем", async function () {
    await registerUser("a@a.com", "aaa", "123456");
    const res = await loginUser("a@a.com", "wrong");
    expect(res.status).toBe(401);
  });
});
