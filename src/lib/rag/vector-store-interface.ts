/**
 * Vector Store Interface
 * 
 * This defines the common interface that all vector store implementations must follow.
 * This allows easy switching between different vector database backends.
 */

export interface DocumentChunk {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    projectId?: string;
    userId?: string;
    sourceFile?: string;
    chunkIndex: number;
    timestamp: number;
    type: 'report' | 'reference' | 'context' | 'user_upload';
  };
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  filter?: Partial<DocumentChunk['metadata']>;
}

export interface VectorStoreStats {
  totalChunks: number;
  vectorDimension: number;
  indexedFields?: string[];
}

/**
 * Base interface that all vector stores must implement
 */
export interface IVectorStore {
  /**
   * Add a single document chunk
   */
  addChunk(chunk: DocumentChunk): Promise<void>;

  /**
   * Add multiple chunks in batch
   */
  addChunks(chunks: DocumentChunk[]): Promise<void>;

  /**
   * Search for similar chunks
   */
  search(
    queryEmbedding: number[],
    options?: SearchOptions
  ): Promise<SearchResult[]>;

  /**
   * Load or prepare chunks for a project (implementation specific)
   */
  loadProjectChunks(projectId: string): Promise<void>;

  /**
   * Delete chunks for a specific project
   */
  deleteProjectChunks?(projectId: string): Promise<void>;

  /**
   * Delete a specific chunk
   */
  deleteChunk?(chunkId: string): Promise<void>;

  /**
   * Clear all data
   */
  clear(): void | Promise<void>;

  /**
   * Get total number of chunks
   */
  size(): number | Promise<number>;

  /**
   * Get statistics about the vector store
   */
  getStats?(): Promise<VectorStoreStats>;

  /**
   * Health check
   */
  healthCheck?(): Promise<boolean>;
}
