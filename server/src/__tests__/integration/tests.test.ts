import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { connectTestDB, closeTestDB, clearDB } from "../helpers/db";
import {
  registerUser,
  loginUser,
  createTest,
  submitTest,
} from "../helpers/factories";

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearDB);

describe("Tests Integration", function () {
  let token: string;
  let testId: string;

  beforeEach(async function () {
    await registerUser("a@a.com", "aaa", "123456");
    const PendingUser = mongoose.model("PendingUser");
    const pending = await PendingUser.findOne({ email: "a@a.com" });
    await request(app).get(`/api/auth/verify/${pending.verificationToken}`);
    const login = await loginUser("a@a.com", "123456");
    token = login.body.accessToken;
  });

  test("CRUD теста", async function () {
    const create = await createTest(token, "Test Title", [
      { question: "q1", answers: ["a", "b"], correctAnswer: "a" },
    ]);
    expect(create.status).toBe(201);
    testId = create.body._id;

    const get = await request(app)
      .get(`/api/tests/${testId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.title).toBe("Test Title");

    const update = await request(app)
      .patch(`/api/tests/${testId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Updated Title")
      .field(
        "questions",
        JSON.stringify([
          { question: "q1", answers: ["a", "b"], correctAnswer: "a" },
        ]),
      );
    expect(update.status).toBe(200);

    const del = await request(app)
      .delete(`/api/tests/${testId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  test("прохождение теста", async function () {
    const create = await createTest(token, "Test", [
      { question: "q1", answers: ["a", "b"], correctAnswer: "a" },
      { question: "q2", answers: ["x", "y"], correctAnswer: "y" },
    ]);
    testId = create.body._id;

    const submit = await submitTest(token, testId, [
      { questionIndex: 0, answer: "a" },
      { questionIndex: 1, answer: "y" },
    ]);
    expect(submit.status).toBe(200);
    expect(submit.body.score).toBe(2);
  });

  test("реакции: лайк → дизлайк → удаление", async function () {
    const create = await createTest(token, "Test", [
      { question: "q1", answers: ["a", "b"], correctAnswer: "a" },
    ]);
    testId = create.body._id;

    const like = await request(app)
      .post(`/api/auth/tests/${testId}/reaction`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "like" });
    expect(like.status).toBe(200);
    expect(like.body.likes).toBe(1);

    const dislike = await request(app)
      .post(`/api/auth/tests/${testId}/reaction`)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "dislike" });
    expect(dislike.status).toBe(200);
    expect(dislike.body.likes).toBe(0);
    expect(dislike.body.dislikes).toBe(1);
  });

  test("комментарии", async function () {
    const create = await createTest(token, "Test", [
      { question: "q1", answers: ["a", "b"], correctAnswer: "a" },
    ]);
    testId = create.body._id;

    const add = await request(app)
      .post(`/api/auth/tests/${testId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "hello" });
    expect(add.status).toBe(200);
    expect(add.body.text).toBe("hello");

    const get = await request(app).get(`/api/auth/tests/${testId}/comments`);
    expect(get.status).toBe(200);
    expect(get.body.length).toBe(1);

    const del = await request(app)
      .delete(`/api/auth/tests/${testId}/comments/${add.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const getAfter = await request(app).get(
      `/api/auth/tests/${testId}/comments`,
    );
    expect(getAfter.body.length).toBe(0);
  });
});
