
import { Project, ProjectProperties } from "../entities/Project";
import { Result } from "@/lib/utils/result";
import { ProjectError } from "../errors/ProjectErrors";

export interface IProjectRepository {
  getById(id: string): Promise<Result<Project, ProjectError>>;
  getByUserId(userId: string): Promise<Result<Project[], ProjectError>>;
  save(project: ProjectProperties): Promise<Result<Project, ProjectError>>;
  delete(id: string): Promise<Result<void, ProjectError>>;
}

export const IProjectRepositoryToken = Symbol("IProjectRepository");
