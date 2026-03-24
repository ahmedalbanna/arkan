import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

export interface GeneratedReportSectionResponse {
  content: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class ReportApiClient {
  async generateReportSectionApi(body: unknown): Promise<Result<GeneratedReportSectionResponse, ApiError>> {
    try {
      const response = await apiService<unknown, GeneratedReportSectionResponse>({
        endpoint: '/api/generate/section',
        method: 'POST',
        data: body,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
