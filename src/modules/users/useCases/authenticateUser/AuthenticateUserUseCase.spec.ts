import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";
import authConfig from "../../../../config/auth";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;


describe("Authenticate User", () => {
  beforeEach(() => {
    authConfig.jwt.secret = "335cd5e290807fd304c6b635e7cb0c5c"
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });


  it("Should be able to authenticate an user", async () =>{
    const user = await inMemoryUsersRepository.create({
      name: "user profile",
      email: "user@profile.com",
      password: "123123",
    });

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: "123123",
    });

    expect(auth.user).toHaveProperty("email", user.email);
    expect(auth).toHaveProperty("token");

  });

  it("should not be able to authenticate a non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "fake@mail.com",
        password: "1234",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate an user with an incorrect password", async () =>{
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "user profile",
        email: "user@profile.com",
        password: "123123",
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "010203",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

});
