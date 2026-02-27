
import { Timestamp } from 'firebase-admin/firestore';

export interface IndexedDocumentRecord {
  id: string;
  projectId: string;
  userId?: string;
  sourceFile: string;
  chunksCount: number;
  fileSize: number;
  type: 'report' | 'reference' | 'context' | 'user_upload';
  timestamp: number;
  indexedAt: Timestamp;
  chunkSize: number;
  overlap: number;
  status: 'indexed' | 'failed' | 'deleted';
  errorMessage?: string;
}

export interface IIndexedDocumentRepository {
    record(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status'>): Promise<string>;
    recordFailed(data: Omit<IndexedDocumentRecord, 'id' | 'timestamp' | 'indexedAt' | 'status' | 'chunksCount'>): Promise<string>;
    getAll(limit?: number): Promise<IndexedDocumentRecord[]>;
    getByProjectId(projectId: string): Promise<IndexedDocumentRecord[]>;
    getByUserId(userId: string): Promise<IndexedDocumentRecord[]>;
    deleteByProjectId(projectId: string): Promise<void>;
    deleteBySourceFile(sourceFile: string): Promise<void>;
    search(query: string): Promise<IndexedDocumentRecord[]>;
    getStats(): Promise<{
        totalDocuments: number;
        totalChunks: number;
        projectCount: number;
        recentUploads: number;
    }>;
}

export const IIndexedDocumentRepositoryToken = Symbol("IIndexedDocumentRepository");
