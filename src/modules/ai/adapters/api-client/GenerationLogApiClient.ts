'use client';

import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

export interface GenerationLog {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  input: unknown;
  output: unknown;
  createdAt: string;
}

interface FetchLogsParams {
  token: string;
  limit: number;
  agentId?: string;
  userId?: string;
  lastVisibleId?: string;
}

export interface GenerationLogsPage {
  logs: GenerationLog[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError('Unexpected generation logs error', 500, error);
};

@injectable()
export class GenerationLogApiClient {
  async fetchGenerationLogs(params: FetchLogsParams): Promise<Result<GenerationLogsPage, ApiError>> {
    const { token, limit, agentId, userId, lastVisibleId } = params;

    if (!token) {
      return Result.fail(new ApiError('Authentication token is required.', 401));
    }

    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (agentId) queryParams.append('agentId', agentId);
    if (userId) queryParams.append('userId', userId);
    if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);

    try {
      const data = await apiService<undefined, GenerationLogsPage>({
        endpoint: `/api/admin/logs?${queryParams.toString()}`,
        token,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
