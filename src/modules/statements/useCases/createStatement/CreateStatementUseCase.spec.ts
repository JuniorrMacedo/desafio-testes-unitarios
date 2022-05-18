import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { OperationType } from "./CreateStatementController";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      statementRepositoryInMemory
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementRepositoryInMemory,
      inMemoryUsersRepository
    );
  });

  it("should be able to make a deposit in an user account", async () => {
    const user = await createUserUseCase.execute({
      name: 'user profile',
      email: 'user@profile.com',
      password: '123123'
    });
    const user_id = <string>user.id;

    const statement = {
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Salary",
    };

    const createStatement = await createStatementUseCase.execute(statement);

    expect(createStatement).toHaveProperty("type", statement.type);
    expect(createStatement).toHaveProperty("amount", statement.amount);
  });


  it("should be able to withdraw credits from an user account", async () => {
    const user = await createUserUseCase.execute({
      name: 'user profile',
      email: 'user@profile.com',
      password: '123123'
    });
    const user_id = <string>user.id;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Salary",
    });

    await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Party",
    });

    const balance = await getBalanceUseCase.execute({ user_id });

    expect(balance).toHaveProperty("balance", 0);
  });

  it("should not be able to make a deposit in a non-existent user account", async () => {
    expect(async () =>{
      const user_id = "unknown";

      await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Salary",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to withdraw credits from a non-existent user account", async () => {
    expect(async ()=> {
      const user_id = "unknown";

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Party",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to withdraw credits from a user account without credits", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'user profile',
        email: 'user@profile.com',
        password: '123123'
      });

      const user_id = <string>user.id;

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 100,
        description: "Party",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
