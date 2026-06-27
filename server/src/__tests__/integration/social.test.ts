import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { connectTestDB, closeTestDB, clearDB } from "../helpers/db";
import { registerUser, loginUser, createTest } from "../helpers/factories";

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearDB);

describe("Social Integration", function () {
  let token: string;

  beforeEach(async function () {
    await registerUser("a@a.com", "aaa", "123456");
    const PendingUser = mongoose.model("PendingUser");
    const pending = await PendingUser.findOne({ email: "a@a.com" });
    await request(app).get(`/api/auth/verify/${pending.verificationToken}`);
    token = (await loginUser("a@a.com", "123456")).body.accessToken;
  });

  test("уведомления", async function () {
    const notifications = await request(app)
      .get("/api/auth/notifications")
      .set("Authorization", `Bearer ${token}`);
    expect(notifications.status).toBe(200);
    expect(Array.isArray(notifications.body)).toBe(true);

    const markRead = await request(app)
      .post("/api/auth/notifications/read")
      .set("Authorization", `Bearer ${token}`);
    expect(markRead.status).toBe(200);
  });

  test("публичные тесты", async function () {
    await createTest(token, "Public Test", [
      { question: "q1", answers: ["a", "b"], correctAnswer: "a" },
    ]);

    const res = await request(app).get("/api/auth/tests/public");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].myReaction || null).toBeNull();
  });
});
