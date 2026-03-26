import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/infrastructure/utils/result';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class WritingToolsApiClient {
  async executeToolApi<TRequest = any, TResponse = any>(
    toolName: string,
    data: TRequest,
  ): Promise<Result<TResponse, ApiError>> {
    try {
      const response = await apiService<TRequest, TResponse>({
        endpoint: `/api/writing-tools/${toolName}`,
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async writingToolApi<TRequest = any, TResponse = any>(
    toolName: string,
    data: TRequest,
  ): Promise<Result<TResponse, ApiError>> {
    return this.executeToolApi(toolName, data);
  }
}
