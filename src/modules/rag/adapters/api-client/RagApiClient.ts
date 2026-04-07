import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/infrastructure/utils/result';
import { type IndexedDocumentRecord } from '../../domain/repositories/IIndexedDocumentRepository';

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
    type?: string;
  }[];
  telemetry?: {
    totalTimeMs: number;
    cacheLookupMs: number;
    embeddingTimeMs: number;
    searchTimeMs: number;
    rerankTimeMs: number;
    isCached: boolean;
    rerankSkipped: boolean;
  };
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

  async getStats(): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<never, any>({ endpoint: '/api/rag/stats' });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async getHealthStatus(): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<never, any>({ endpoint: '/api/rag/health' });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async getCacheStats(): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<never, any>({ endpoint: '/api/rag/cache-stats' });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async clearCache(): Promise<Result<void, ApiError>> {
    try {
      await apiService<never, void>({ endpoint: '/api/rag/clear-cache', method: 'POST' });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async getIndexedDocuments(limit?: number): Promise<Result<IndexedDocumentRecord[], ApiError>> {
    try {
      const endpoint = limit ? `/api/rag/documents?limit=${limit}` : '/api/rag/documents';
      const response = await apiService<never, IndexedDocumentRecord[]>({ endpoint });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async deleteIndexedDocument(options: { projectId?: string, sourceFile?: string }): Promise<Result<void, ApiError>> {
    try {
      await apiService<any, void>({
        endpoint: '/api/rag/delete-document',
        method: 'DELETE',
        data: options,
      });
      return Result.ok();
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async compareReranking(query: string, strategy?: string): Promise<Result<any, ApiError>> {
    try {
      const response = await apiService<any, any>({
        endpoint: '/api/rag/compare-reranking',
        method: 'POST',
        data: { query, strategy },
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
