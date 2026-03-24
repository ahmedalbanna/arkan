import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

export interface GenerationLogResponse {
  logs: any[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class GenerationLogApiClient {
  async fetchLogsApi(params: {
    limit: number;
    agentId?: string;
    userId?: string;
    lastVisibleId?: string;
  }): Promise<Result<GenerationLogResponse, ApiError>> {
    try {
      const query = new URLSearchParams({ limit: params.limit.toString() });
      if (params.agentId) query.set('agentId', params.agentId);
      if (params.userId) query.set('userId', params.userId);
      if (params.lastVisibleId) query.set('lastVisibleId', params.lastVisibleId);

      const data = await apiService<never, GenerationLogResponse>({
        endpoint: `/api/admin/manage-generations?${query.toString()}`,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async fetchGenerationLogs(params: {
    limit: number;
    userId?: string;
    lastVisibleId?: string;
  }): Promise<Result<GenerationLogResponse, ApiError>> {
    try {
      const query = new URLSearchParams({ limit: params.limit.toString() });
      if (params.userId) query.set('userId', params.userId);
      if (params.lastVisibleId) query.set('lastVisibleId', params.lastVisibleId);

      const data = await apiService<never, GenerationLogResponse>({
        endpoint: `/api/admin/manage-generations?${query.toString()}`,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
