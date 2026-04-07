
import { injectable } from "tsyringe";
import { ProjectApiClient } from "./ProjectApiClient";
import { LocalProjectService } from "../../infrastructure/storage/LocalProjectService";
import { Project, type ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/infrastructure/utils/result";
import { container } from "@/infrastructure/di/container";

@injectable()
export class ProjectSyncService {
    async syncProjects(): Promise<Result<Project[], Error>> {
        try {
            const apiClient = container.resolve(ProjectApiClient);
            const localService = container.resolve(LocalProjectService);

            const result = await apiClient.fetchProjects();
            
            if (result.isSuccess) {
                const serverProjects = result.getValue();
                const projects = serverProjects.map(props => new Project(props));
                
                // Update local storage in the background
                for (const project of projects) {
                    await localService.saveProject(project.toProperties());
                }
                
                return Result.ok(projects);
            }

            // Fallback to local storage if API fails
            console.warn('Project sync failed, falling back to local storage:', result.error);
            const localProjectsProps = await localService.getAllProjects();
            const localProjects = localProjectsProps.map(props => new Project(props));
            
            return Result.ok(localProjects);
        } catch (error: any) {
            return Result.fail(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
