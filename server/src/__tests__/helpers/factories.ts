import request from "supertest";
import app from "../../app";

export async function registerUser(
  email: string,
  username: string,
  password: string,
) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email, username, password });
  return res;
}

export async function verifyUser(token: string) {
  const res = await request(app).get(`/api/auth/verify/${token}`);
  return res;
}

export async function loginUser(email: string, password: string) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return res;
}

export async function createTest(
  token: string,
  title: string,
  questions: object[],
) {
  const res = await request(app)
    .post("/api/tests")
    .set("Authorization", `Bearer ${token}`)
    .field("title", title)
    .field("visibility", "public")
    .field("questions", JSON.stringify(questions));
  return res;
}

export async function submitTest(
  token: string,
  testId: string,
  answers: object[],
) {
  const res = await request(app)
    .post(`/api/tests/${testId}/submit`)
    .set("Authorization", `Bearer ${token}`)
    .send({ answers });
  return res;
}
