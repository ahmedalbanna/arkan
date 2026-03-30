
import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";

@injectable()
export class GetProjectByIdUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string): Promise<Result<Project, ProjectError>> {
    const result = await this.projectRepository.getById(projectId);
    if (result.isFailure) {
      return Result.fail(ProjectError.notFound(`Project with id ${projectId} not found: ${result.error?.message || 'Unknown error'}`));
    }
    return Result.ok(result.getValue());
  }
}
