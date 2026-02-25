import "reflect-metadata";

import { injectable, inject } from "tsyringe";
import { GetProjectsUseCase } from "../../application/use-cases/GetProjectsUseCase";
import { SaveProjectUseCase } from "../../application/use-cases/SaveProjectUseCase";
import { GetProjectByIdUseCase } from "../../application/use-cases/GetProjectByIdUseCase";
import { DeleteProjectUseCase } from "../../application/use-cases/DeleteProjectUseCase";

@injectable()
export class ProjectController {
    constructor(
        @inject(GetProjectsUseCase) private getProjectsUseCase: GetProjectsUseCase,
        @inject(SaveProjectUseCase) private saveProjectUseCase: SaveProjectUseCase,
        @inject(GetProjectByIdUseCase) private getProjectByIdUseCase: GetProjectByIdUseCase,
        @inject(DeleteProjectUseCase) private deleteProjectUseCase: DeleteProjectUseCase
    ) {}

    async getProjects(userId: string) {
        return this.getProjectsUseCase.execute(userId);
    }

    async getProjectById(projectId: string) {
        return this.getProjectByIdUseCase.execute(projectId);
    }

    async saveProject(projectData: any, userId: string) {
        return this.saveProjectUseCase.execute(projectData, userId);
    }

    async deleteProject(projectId: string) {
        return this.deleteProjectUseCase.execute(projectId);
    }
}
