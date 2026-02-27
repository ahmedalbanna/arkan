
import { Project, ProjectProperties } from "../entities/Project";

export interface IProjectRepository {
  getById(id: string): Promise<Project | null>;
  getByUserId(userId: string): Promise<Project[]>;
  save(project: ProjectProperties): Promise<Project>;
  delete(id: string): Promise<void>;
}

export const IProjectRepositoryToken = Symbol("IProjectRepository");
