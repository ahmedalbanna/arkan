'use client';

import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

const API_ENDPOINT = '/api/svg-conversion';

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class ImageConversionApiClient {
  async convertImageToSvgApi(formData: FormData): Promise<Result<string, ApiError>> {
    try {
      const response = await apiService<FormData, string>({
        endpoint: API_ENDPOINT,
        method: 'POST',
        data: formData,
        isFormData: true,
        responseType: 'text',
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
