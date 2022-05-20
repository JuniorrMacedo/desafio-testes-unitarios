import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app"
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";


let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c";
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    const user = {
      name: "user profile",
      email: "user@profile.com",
      password: "123123"
    };

    await request(app).post("/api/v1/users").send(user);

    const auth = await request(app).post("/api/v1/sessions").send({
      email: "user@profile.com",
      password: "123123"
    });

    const { token } = auth.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", user.name);
    expect(response.body).toHaveProperty("email", user.email);
  });

  it("should not be able to show a non-existent user profile", async () => {
    const token = "invalid_token";

    const response = await request(app)
      .get("/api/v1/profile")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(401);

  });
});
