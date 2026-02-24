
import { inject, injectable } from "tsyringe";
import { IProjectRepository, IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { ProjectProperties } from "../../domain/entities/Project";

@injectable()
export class SaveProjectUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectData: ProjectProperties, userId: string): Promise<ProjectProperties> {
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
