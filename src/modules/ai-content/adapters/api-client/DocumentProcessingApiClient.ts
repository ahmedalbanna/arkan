import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/infrastructure/utils/result';

export interface ProcessedDocumentResult {
  text: string;
  markdown: string;
  metadata: {
    pageCount: number;
    title?: string;
    author?: string;
  };
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class DocumentProcessingApiClient {
  async processFileApi(formData: FormData): Promise<Result<ProcessedDocumentResult, ApiError>> {
    try {
      const response = await apiService<FormData, ProcessedDocumentResult>({
        endpoint: '/api/process-file',
        method: 'POST',
        data: formData,
        isFormData: true,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
