import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { ProjectProperties } from '../../domain/entities/ProjectProperties';
import { Result } from '@/infrastructure/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class ProjectApiClient {
    async fetchProjects(): Promise<Result<ProjectProperties[], ApiError>> {
        try {
            const data = await apiService<never, ProjectProperties[]>({ 
                endpoint: '/api/projects'
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async fetchProjectById(id: string): Promise<Result<ProjectProperties, ApiError>> {
        try {
            const data = await apiService<never, ProjectProperties>({ 
                endpoint: `/api/projects/${id}`
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async saveProject(data: ProjectProperties): Promise<Result<ProjectProperties, ApiError>> {
        try {
            const response = await apiService<ProjectProperties, ProjectProperties>({
                endpoint: `/api/projects`,
                method: 'POST',
                data,
            });
            return Result.ok(response);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async deleteProject(id: string): Promise<Result<{ message: string }, ApiError>> {
        try {
            const response = await apiService<never, { message: string }>({
                endpoint: `/api/projects/${id}`,
                method: 'DELETE'
            });
            return Result.ok(response);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }
}
