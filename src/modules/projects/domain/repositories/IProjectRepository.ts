
import { Project, ProjectProperties } from "../entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../errors/ProjectErrors";
import { ProjectSnapshot } from "../entities/ProjectSnapshot";

export interface IProjectRepository {
  getById(id: string): Promise<Result<Project, ProjectError>>;
  getByUserId(userId: string): Promise<Result<Project[], ProjectError>>;
  save(project: ProjectProperties): Promise<Result<Project, ProjectError>>;
  delete(id: string): Promise<Result<void, ProjectError>>;

  // Snapshots
  saveSnapshot(snapshot: ProjectSnapshot): Promise<Result<ProjectSnapshot, ProjectError>>;
  getSnapshots(projectId: string): Promise<Result<ProjectSnapshot[], ProjectError>>;
  deleteSnapshot(id: string): Promise<Result<void, ProjectError>>;
}

export const IProjectRepositoryToken = Symbol("IProjectRepository");
