
import { inject, injectable } from "tsyringe";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";

@injectable()
export class GetProjectsUseCase {
  constructor(
    @inject(IProjectRepositoryToken)
    private projectRepository: IProjectRepository
  ) {}

  async execute(userId: string): Promise<Result<Project[], ProjectError>> {
    return this.projectRepository.getByUserId(userId);
  }
}
