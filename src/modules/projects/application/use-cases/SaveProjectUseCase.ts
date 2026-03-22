
import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { Project, ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/lib/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";

@injectable()
export class SaveProjectUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectData: ProjectProperties, userId: string): Promise<Result<Project, ProjectError>> {
    const dataToSave = {
      ...projectData,
      meta: {
        ...projectData.meta,
        author: userId,
      }
    };
    return this.projectRepository.save(dataToSave);
  }
}
