
import { inject, injectable } from "tsyringe";
import { IProjectRepository, IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { ProjectProperties } from "../../domain/entities/Project";

@injectable()
export class GetProjectsUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(userId: string): Promise<ProjectProperties[]> {
    return this.projectRepository.getByUserId(userId);
  }
}
