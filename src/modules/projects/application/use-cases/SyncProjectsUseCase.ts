
import { inject, injectable } from "tsyringe";
import { Project, type ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import type { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { IProjectRepositoryToken } from "../../domain/repositories/IProjectRepository";

export interface SyncProjectsInput {
    serverProjects: ProjectProperties[];
    localProjects: ProjectProperties[];
}

@injectable()
export class SyncProjectsUseCase {
    constructor(
        @inject(IProjectRepositoryToken)
        private projectRepository: IProjectRepository
    ) {}

    /**
     * Synchronizes projects between server and local storage.
     * In this implementation, server projects are considered the source of truth,
     * but we provide a hook for future conflict resolution logic.
     */
    async execute(input: SyncProjectsInput): Promise<Result<Project[], ProjectError>> {
        try {
            const { serverProjects } = input;
            
            // For now, we simply convert server properties to Project entities.
            // This can be expanded to handle complex merge logic if needed.
            const syncedProjects = serverProjects.map(props => new Project(props));
            
            return Result.ok(syncedProjects);
        } catch (error: any) {
            return Result.fail(ProjectError.internal(`Sync failed: ${error.message}`));
        }
    }
}
