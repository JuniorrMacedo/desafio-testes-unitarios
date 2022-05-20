import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import authConfig from "../../../../config/auth";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c"
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("123123", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'user profile', 'user@profile.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to make a deposit in an user account", async () => {
    const auth = await request(app).post("/api/v1/sessions").send({
      email: "user@profile.com",
      password: "123123",
    });

    const { token } = auth.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Salary",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100);
  });

  it("should be able to withdraw credits from an user account", async () => {
    const auth = await request(app).post("/api/v1/sessions").send({
      email: "user@profile.com",
      password: "123123",
    });

    const { token } = auth.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 60,
        description: "Party",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(60);
  });

  it("should not be able to make a deposit in a non-existent user account", async () => {
    const token = "invalid_token";

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Salary",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

      expect(response.status).toBe(401);
  });

  it("should not be able to withdraw credits from a non-existent user account", async () => {
    const token = "invalid_token";

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 60,
        description: "Party",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

      expect(response.status).toBe(401);
  });

  it("should not be able to withdraw credits from a user account without credits", async () => {
    const auth = await request(app).post("/api/v1/sessions").send({
      email: "user@profile.com",
      password: "123123",
    });

    const { token } = auth.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Party2",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

      expect(response.status).toBe(400);
  });
});
