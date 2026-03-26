
export interface IndexedDocumentRecord {
  id: string;
  projectId: string;
  userId?: string;
  sourceFile: string;
  chunksCount: number;
  fileSize: number;
  type: 'report' | 'reference' | 'context' | 'user_upload';
  timestamp: number;
  indexedAt: Date | string;
  chunkSize: number;
  overlap: number;
  status: 'indexed' | 'failed' | 'deleted';
  errorMessage?: string;
}

import { Result } from "@/infrastructure/utils/result";
import { RagError } from "../errors/RagErrors";

export interface IIndexedDocumentRepository {
    record(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status'>): Promise<Result<string, RagError>>;
    recordFailed(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status' | 'chunksCount'>): Promise<Result<string, RagError>>;
    getAll(limit?: number): Promise<Result<IndexedDocumentRecord[], RagError>>;
    getByProjectId(projectId: string): Promise<Result<IndexedDocumentRecord[], RagError>>;
    getByUserId(userId: string): Promise<Result<IndexedDocumentRecord[], RagError>>;
    deleteByProjectId(projectId: string): Promise<Result<void, RagError>>;
    deleteBySourceFile(sourceFile: string): Promise<Result<void, RagError>>;
    search(query: string): Promise<Result<IndexedDocumentRecord[], RagError>>;
    getStats(): Promise<Result<{
        totalDocuments: number;
        totalChunks: number;
        projectCount: number;
        recentUploads: number;
    }, RagError>>;
}

export const IIndexedDocumentRepositoryToken = Symbol("IIndexedDocumentRepository");
