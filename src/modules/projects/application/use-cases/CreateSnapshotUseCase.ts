import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { ProjectSnapshot } from "../../domain/entities/ProjectSnapshot";
import { ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class CreateSnapshotUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string, name: string, snapshotData: ProjectProperties): Promise<Result<ProjectSnapshot, ProjectError>> {
    const snapshot = new ProjectSnapshot({
      id: uuidv4(),
      projectId,
      name,
      snapshotData,
      created: new Date().toISOString(),
    });

    return this.projectRepository.saveSnapshot(snapshot);
  }
}
