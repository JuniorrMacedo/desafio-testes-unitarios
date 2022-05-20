import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app"
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c"
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate an user", async () => {
    const user = {
      name: "user profile",
      email: "user@profile.com",
      password: "123123"
    }

    await request(app).post("/api/v1/users").send(user);
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@profile.com",
      password: "123123",
    });

    expect(response.body.user).toHaveProperty("email", user.email);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existent user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "fake@mail.com",
      password: "123123",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate an user with an incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user profile",
      email: "user@profile.com",
      password: "123123",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@profile.com",
      password: "123",
    });

    expect(response.status).toBe(401);
  });
});
