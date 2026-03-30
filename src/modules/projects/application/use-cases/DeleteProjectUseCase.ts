
import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";

@injectable()
export class DeleteProjectUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string): Promise<Result<void, ProjectError>> {
    const result = await this.projectRepository.delete(projectId);
    if (result.isFailure) {
      return Result.fail(ProjectError.deleteError(`Failed to delete project ${projectId}: ${result.error?.message || 'Unknown error'}`));
    }
    return Result.ok();
  }
}
