import "reflect-metadata";
import { GetProjectByIdUseCase } from "../GetProjectByIdUseCase";
import { IProjectRepository } from "../../../domain/repositories/IProjectRepository";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../../domain/errors/ProjectErrors";

describe("GetProjectByIdUseCase", () => {
  let useCase: GetProjectByIdUseCase;
  let mockRepository: jest.Mocked<IProjectRepository>;

  beforeEach(() => {
    mockRepository = {
      getById: jest.fn(),
      getByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    useCase = new GetProjectByIdUseCase(mockRepository);
  });

  it("should return a success Result when project is found", async () => {
    // Arrange
    const mockProject: any = {
      id: "project-123",
      name: "Test Project",
    };
    
    mockRepository.getById.mockResolvedValue(Result.ok(mockProject));

    // Act
    const result = await useCase.execute("project-123");

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe("project-123");
    expect(mockRepository.getById).toHaveBeenCalledWith("project-123");
  });

  it("should return a failure Result when project is not found", async () => {
    // Arrange
    const error = ProjectError.notFound("Project not found");
    mockRepository.getById.mockResolvedValue(Result.fail(error));

    // Act
    const result = await useCase.execute("non-existent");

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe("Project not found");
    expect(result.error?.type).toBe("NOT_FOUND");
  });

  it("should propagate internal repository errors", async () => {
    // Arrange
    const error = ProjectError.internal("Database connection failed");
    mockRepository.getById.mockResolvedValue(Result.fail(error));

    // Act
    const result = await useCase.execute("project-123");

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error?.type).toBe("INTERNAL");
    expect(result.error?.message).toBe("Database connection failed");
  });
});
