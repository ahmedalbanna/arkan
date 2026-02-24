
import { ProjectProperties } from "../entities/Project";

export interface IProjectRepository {
  getById(id: string): Promise<ProjectProperties | null>;
  getByUserId(userId: string): Promise<ProjectProperties[]>;
  save(project: ProjectProperties): Promise<ProjectProperties>;
  delete(id: string): Promise<void>;
}

export const IProjectRepositoryToken = Symbol("IProjectRepository");
