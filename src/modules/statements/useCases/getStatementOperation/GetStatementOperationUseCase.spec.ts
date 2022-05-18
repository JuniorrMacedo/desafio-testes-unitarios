import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { OperationType } from "../createStatement/CreateStatementController";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      statementRepositoryInMemory
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      statementRepositoryInMemory
    );
  });

  it("should be able get a statement from an user account", async () => {
    const user = await createUserUseCase.execute({
      name: 'user profile',
      email: 'user@profile.com',
      password: '123123'
    });
    const user_id = <string>user.id;

    const statement = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Salary",
    });

    const statement_id = <string>statement.id;

    const returnedStatement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(returnedStatement).toBeInstanceOf(Statement);
    expect(returnedStatement).toHaveProperty("id");
  });

  it("should not be able get a statement from a non-existent user account", async () => {
    expect(async () => {
      const user_id = "unknown";

      const statement_id = "unknown1";

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able get a non-existent statement", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'user profile',
        email: 'user@profile.com',
        password: '123123'
      });
      const user_id = <string>user.id;

      const statement = await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Salary",
      });

      const statement_id = "unknown1";

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
