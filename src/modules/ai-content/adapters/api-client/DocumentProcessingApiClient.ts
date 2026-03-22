'use client';

import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

export interface ProcessedDocumentResult {
  markdown: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError('Unexpected document processing error', 500, error);
};

@injectable()
export class DocumentProcessingApiClient {
  async processFileApi(formData: FormData, token: string): Promise<Result<ProcessedDocumentResult, ApiError>> {
    try {
      const result = await apiService<FormData, ProcessedDocumentResult>({
        endpoint: '/api/process-file',
        method: 'POST',
        data: formData,
        token,
        isFormData: true,
      });

      return Result.ok(result);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onabort = () => reject(new Error('File reading was aborted.'));
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.onload = () => {
        resolve(reader.result as string);
      };

      const isTextFile = file.type.startsWith('text/') || file.name.endsWith('.md');
      if (isTextFile) {
        reader.readAsText(file);
        return;
      }

      reader.readAsDataURL(file);
    });
  }
}
