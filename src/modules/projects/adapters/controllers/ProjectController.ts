import { delay, inject, injectable } from "tsyringe";
import { GetProjectsUseCase } from "../../application/use-cases/GetProjectsUseCase";
import { SaveProjectUseCase } from "../../application/use-cases/SaveProjectUseCase";
import { GetProjectByIdUseCase } from "../../application/use-cases/GetProjectByIdUseCase";
import { DeleteProjectUseCase } from "../../application/use-cases/DeleteProjectUseCase";
import { CreateSnapshotUseCase } from "../../application/use-cases/CreateSnapshotUseCase";
import { GetSnapshotsUseCase } from "../../application/use-cases/GetSnapshotsUseCase";
import { DeleteSnapshotUseCase } from "../../application/use-cases/DeleteSnapshotUseCase";
import { Result } from "@/infrastructure/utils/result";
import { Project, ProjectProperties } from "../../domain/entities/Project";
import { ProjectError } from "../../domain/errors/ProjectErrors";
import { ProjectSnapshot } from "../../domain/entities/ProjectSnapshot";

@injectable()
export class ProjectController {
    constructor(
        @inject(delay(() => GetProjectsUseCase))
        private getProjectsUseCase: GetProjectsUseCase,
        @inject(delay(() => SaveProjectUseCase))
        private saveProjectUseCase: SaveProjectUseCase,
        @inject(delay(() => GetProjectByIdUseCase))
        private getProjectByIdUseCase: GetProjectByIdUseCase,
        @inject(delay(() => DeleteProjectUseCase))
        private deleteProjectUseCase: DeleteProjectUseCase,
        @inject(delay(() => CreateSnapshotUseCase))
        private createSnapshotUseCase: CreateSnapshotUseCase,
        @inject(delay(() => GetSnapshotsUseCase))
        private getSnapshotsUseCase: GetSnapshotsUseCase,
        @inject(delay(() => DeleteSnapshotUseCase))
        private deleteSnapshotUseCase: DeleteSnapshotUseCase
    ) {}

    async getProjects(userId: string): Promise<Result<Project[], ProjectError>> {
        return this.getProjectsUseCase.execute(userId);
    }

    async getProjectById(projectId: string): Promise<Result<Project, ProjectError>> {
        return this.getProjectByIdUseCase.execute(projectId);
    }

    async saveProject(projectData: ProjectProperties, userId: string): Promise<Result<Project, ProjectError>> {
        return this.saveProjectUseCase.execute(projectData, userId);
    }

    async deleteProject(projectId: string): Promise<Result<void, ProjectError>> {
        return this.deleteProjectUseCase.execute(projectId);
    }

    async createSnapshot(projectId: string, name: string, snapshotData: ProjectProperties): Promise<Result<ProjectSnapshot, ProjectError>> {
        return this.createSnapshotUseCase.execute(projectId, name, snapshotData);
    }

    async getSnapshots(projectId: string): Promise<Result<ProjectSnapshot[], ProjectError>> {
        return this.getSnapshotsUseCase.execute(projectId);
    }

    async deleteSnapshot(snapshotId: string): Promise<Result<void, ProjectError>> {
        return this.deleteSnapshotUseCase.execute(snapshotId);
    }
}
