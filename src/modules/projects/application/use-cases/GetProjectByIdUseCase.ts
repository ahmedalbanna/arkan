import "reflect-metadata";

import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { ProjectProperties } from "../../domain/entities/Project";

@injectable()
export class GetProjectByIdUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string): Promise<ProjectProperties | null> {
    return this.projectRepository.getById(projectId);
  }
}
