import { delay, inject, injectable } from "tsyringe";
import { GetProjectsUseCase } from "../../application/use-cases/GetProjectsUseCase";
import { SaveProjectUseCase } from "../../application/use-cases/SaveProjectUseCase";
import { GetProjectByIdUseCase } from "../../application/use-cases/GetProjectByIdUseCase";
import { DeleteProjectUseCase } from "../../application/use-cases/DeleteProjectUseCase";
import { revalidatePath } from "next/cache";

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
        private deleteProjectUseCase: DeleteProjectUseCase
    ) {}

    async getProjects(userId: string) {
        return this.getProjectsUseCase.execute(userId);
    }

    async getProjectById(projectId: string) {
        return this.getProjectByIdUseCase.execute(projectId);
    }

    async saveProject(projectData: any, userId: string) {
        const result = await this.saveProjectUseCase.execute(projectData, userId);
        if (result.isSuccess) {
            const project = result.getValue();
            revalidatePath(`/builder?id=${project.id}`);
            revalidatePath('/dashboard');
        }
        return result;
    }

    async deleteProject(projectId: string) {
        const result = await this.deleteProjectUseCase.execute(projectId);
        if (result.isSuccess) {
            revalidatePath('/dashboard');
        }
        return result;
    }
}
