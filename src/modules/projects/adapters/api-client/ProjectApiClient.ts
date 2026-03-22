
import { apiService, ApiError } from "@/infrastructure/api/ApiService";
import { ProjectProperties } from "../../domain/entities/Project";
import { Result } from "@/lib/utils/result";

export class ProjectApiClient {
    async fetchProjects(token: string): Promise<Result<ProjectProperties[], ApiError>> {
        try {
            const data = await apiService<any, ProjectProperties[]>({ endpoint: '/api/projects', token });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    async fetchProjectById(id: string, token: string): Promise<Result<ProjectProperties, ApiError>> {
        try {
            const data = await apiService<any, ProjectProperties>({ endpoint: `/api/projects/${id}`, token });
            return Result.ok(data);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    async saveProject(data: ProjectProperties, token: string): Promise<Result<ProjectProperties, ApiError>> {
        try {
            const result = await apiService<ProjectProperties, ProjectProperties>({
                endpoint: '/api/projects',
                method: 'POST',
                data,
                token
            });
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(error);
        }
    }

    async deleteProject(id: string, token: string): Promise<Result<{ message: string }, ApiError>> {
        try {
            const result = await apiService<any, { message: string }>({
                endpoint: `/api/projects/${id}`,
                method: 'DELETE',
                token
            });
            return Result.ok(result);
        } catch (error: any) {
            return Result.fail(error);
        }
    }
}
