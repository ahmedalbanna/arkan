'use client';

import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

export interface GeneratedReportSectionResponse {
  content: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError('Unexpected report API error', 500, error);
};

@injectable()
export class ReportApiClient {
  async generateReportSectionApi(body: unknown, token: string): Promise<Result<GeneratedReportSectionResponse, ApiError>> {
    try {
      const data = await apiService<unknown, GeneratedReportSectionResponse>({
        endpoint: '/api/generate/section',
        method: 'POST',
        data: body,
        token,
      });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
