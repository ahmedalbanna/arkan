import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/infrastructure/utils/result';

export interface IndexDocumentResponse {
  message: string;
  documentId: string;
}

export interface RetrieveContextResponse {
  context: string;
  sources: {
    fileName: string;
    score: number;
    text: string;
  }[];
}

export interface IndexDocumentInput {
  content: string;
  fileName: string;
  projectId?: string;
  type: 'user_upload' | 'reference';
}

export interface RetrieveContextInput {
  query: string;
  projectId?: string;
  topK: number;
  minScore: number;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class RagApiClient {
  async indexDocument(data: IndexDocumentInput): Promise<Result<IndexDocumentResponse, ApiError>> {
    try {
      const response = await apiService<IndexDocumentInput, IndexDocumentResponse>({
        endpoint: '/api/rag/index-document',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async retrieveContext(data: RetrieveContextInput): Promise<Result<RetrieveContextResponse, ApiError>> {
    try {
      const response = await apiService<RetrieveContextInput, RetrieveContextResponse>({
        endpoint: '/api/rag/retrieve-context',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
