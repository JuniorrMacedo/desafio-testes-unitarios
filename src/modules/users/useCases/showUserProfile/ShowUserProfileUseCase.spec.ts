import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

import { ShowUserProfileError } from "./ShowUserProfileError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";


let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;


describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase= new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "user profile",
      email: "user@profile.com",
      password: "123123"
    });
    const user_id = <string>user.id;

    const userProfile = await showUserProfileUseCase.execute(user_id);

    expect(userProfile).toHaveProperty("name", user.name);
    expect(userProfile).toHaveProperty("email", user.email);
  });
});

  it("should not be able to show a non-existent user profile", async () => {
    await expect(showUserProfileUseCase.execute("non-existing-user"))
      .rejects.toBeInstanceOf(ShowUserProfileError);
  });
