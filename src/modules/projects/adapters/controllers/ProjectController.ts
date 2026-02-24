
import { injectable } from "tsyringe";
import { GetProjectsUseCase } from "../../application/use-cases/GetProjectsUseCase";
import { SaveProjectUseCase } from "../../application/use-cases/SaveProjectUseCase";
import { GetProjectByIdUseCase } from "../../application/use-cases/GetProjectByIdUseCase";
import { DeleteProjectUseCase } from "../../application/use-cases/DeleteProjectUseCase";

@injectable()
export class ProjectController {
    constructor(
        private getProjectsUseCase: GetProjectsUseCase,
        private saveProjectUseCase: SaveProjectUseCase,
        private getProjectByIdUseCase: GetProjectByIdUseCase,
        private deleteProjectUseCase: DeleteProjectUseCase
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
