import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "user test",
      email: "user@test.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user with same email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "user test1",
        email: "user@test.com",
        password: "123456",
      });

      await createUserUseCase.execute({
        name: "user test2",
        email: "user@test.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
