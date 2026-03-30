import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";

@injectable()
export class DeleteSnapshotUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(snapshotId: string): Promise<Result<void, ProjectError>> {
    const result = await this.projectRepository.deleteSnapshot(snapshotId);
    if (result.isFailure) {
        return Result.fail(ProjectError.deleteError(`Failed to delete snapshot ${snapshotId}: ${result.error?.message || 'Unknown error'}`));
    }
    return Result.ok();
  }
}
