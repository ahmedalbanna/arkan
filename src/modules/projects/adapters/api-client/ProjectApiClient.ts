
import { apiService } from "@/infrastructure/api/ApiService";
import { ProjectProperties } from "../../domain/entities/Project";

export class ProjectApiClient {
    async fetchProjects(token: string): Promise<ProjectProperties[]> {
        return apiService({ endpoint: '/api/projects', token });
    }

    async fetchProjectById(id: string, token: string): Promise<ProjectProperties> {
        return apiService({ endpoint: `/api/projects/${id}`, token });
    }

    async saveProject(data: ProjectProperties, token: string): Promise<ProjectProperties> {
        return apiService({
            endpoint: '/api/projects',
            method: 'POST',
            data,
            token
        });
    }

    async deleteProject(id: string, token: string): Promise<{ message: string }> {
        return apiService({
            endpoint: `/api/projects/${id}`,
            method: 'DELETE',
            token
        });
    }
}
