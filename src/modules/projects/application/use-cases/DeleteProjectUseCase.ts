
import { inject, injectable } from "tsyringe";
import { IProjectRepository, IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";

@injectable()
export class DeleteProjectUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(projectId: string): Promise<void> {
    return this.projectRepository.delete(projectId);
  }
}
