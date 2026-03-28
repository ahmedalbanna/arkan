import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { type ProjectProperties } from '../../domain/entities/Project';
import { type ProjectSnapshotProperties } from '../../domain/entities/ProjectSnapshot';
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

    async fetchSnapshots(projectId: string): Promise<Result<ProjectSnapshotProperties[], ApiError>> {
        try {
            const data = await apiService<never, ProjectSnapshotProperties[]>({
                endpoint: `/api/projects/${projectId}/snapshots`
            });
            return Result.ok(data);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async createSnapshot(projectId: string, name: string, snapshotData: ProjectProperties): Promise<Result<ProjectSnapshotProperties, ApiError>> {
        try {
            const response = await apiService<{ name: string; snapshotData: ProjectProperties }, ProjectSnapshotProperties>({
                endpoint: `/api/projects/${projectId}/snapshots`,
                method: 'POST',
                data: { name, snapshotData }
            });
            return Result.ok(response);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }

    async deleteSnapshot(snapshotId: string): Promise<Result<{ success: boolean }, ApiError>> {
        try {
            const response = await apiService<never, { success: boolean }>({
                endpoint: `/api/snapshots/${snapshotId}`,
                method: 'DELETE'
            });
            return Result.ok(response);
        } catch (error: unknown) {
            return Result.fail(toApiError(error));
        }
    }
}
