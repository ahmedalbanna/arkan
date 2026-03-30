import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { ProjectSnapshot } from "../../domain/entities/ProjectSnapshot";
import { ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import { v4 as uuidv4 } from 'uuid';
import { ProjectSnapshotSchema } from "../../domain/schemas/SnapshotSchema";

@injectable()
export class CreateSnapshotUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string, name: string, snapshotData: ProjectProperties): Promise<Result<ProjectSnapshot, ProjectError>> {
    // 1. Validate data
    const validation = ProjectSnapshotSchema.safeParse({
        projectId,
        name,
        snapshotData
    });

    if (!validation.success) {
        const errorMessages = validation.error.errors
            .map(err => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
        return Result.fail(ProjectError.validation(`Validation failed: ${errorMessages}`));
    }

    // 2. Map and Save
    const snapshot = new ProjectSnapshot({
      id: uuidv4(),
      projectId,
      name,
      snapshotData,
      created: new Date().toISOString(),
    });

    const result = await this.projectRepository.saveSnapshot(snapshot);
    if (result.isFailure) {
        return Result.fail(ProjectError.saveError(`Failed to save snapshot: ${result.error?.message || 'Unknown error'}`));
    }

    return Result.ok(result.getValue());
  }
}
