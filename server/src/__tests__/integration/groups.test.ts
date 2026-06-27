import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { connectTestDB, closeTestDB, clearDB } from "../helpers/db";
import { registerUser, loginUser } from "../helpers/factories";

beforeAll(connectTestDB);
afterAll(closeTestDB);
beforeEach(clearDB);

describe("Groups Integration", function () {
  let adminToken: string;
  let userToken: string;
  let groupId: string;
  let inviteCode: string;

  beforeEach(async function () {
    await registerUser("admin@a.com", "admin", "123456");
    let PendingUser = mongoose.model("PendingUser");
    let pending = await PendingUser.findOne({ email: "admin@a.com" });
    await request(app).get(`/api/auth/verify/${pending.verificationToken}`);
    adminToken = (await loginUser("admin@a.com", "123456")).body.accessToken;

    await registerUser("user@a.com", "user", "123456");
    pending = await PendingUser.findOne({ email: "user@a.com" });
    await request(app).get(`/api/auth/verify/${pending.verificationToken}`);
    userToken = (await loginUser("user@a.com", "123456")).body.accessToken;
  });

  test("создание → вступление → повышение → понижение → кик → выход", async function () {
    const create = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Test Group")
      .field("description", "desc");
    expect(create.status).toBe(201);
    groupId = create.body._id;
    inviteCode = create.body.inviteCode;

    const join = await request(app)
      .post("/api/groups/join")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ inviteCode });
    expect(join.status).toBe(200);

    const get = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(get.status).toBe(200);
    expect(get.body.members.length).toBe(2);

    const promote = await request(app)
      .post(`/api/groups/${groupId}/promote/${get.body.members[1]._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(promote.status).toBe(200);

    const demote = await request(app)
      .post(`/api/groups/${groupId}/demote/${get.body.members[1]._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(demote.status).toBe(200);

    const kick = await request(app)
      .post(`/api/groups/${groupId}/kick/${get.body.members[1]._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(kick.status).toBe(200);
  });
});
