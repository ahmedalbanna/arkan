/**
 * Qdrant Vector Database Adapter
 * 
 * This adapter implements the VectorStore interface using Qdrant as the backend.
 * Qdrant provides production-ready vector search with advanced filtering and high performance.
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import type { DocumentChunk, SearchResult } from './vector-store';

export interface QdrantConfig {
  url: string;
  apiKey?: string;
  collectionName: string;
  vectorDimension: number;
}

/**
 * Qdrant Vector Store Implementation
 */
export class QdrantVectorStore {
  private client: QdrantClient;
  private collectionName: string;
  private vectorDimension: number;
  private initialized: boolean = false;

  constructor(config: QdrantConfig) {
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
    });
    this.collectionName = config.collectionName;
    this.vectorDimension = config.vectorDimension;
  }

  /**
   * Initialize the collection if it doesn't exist
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col) => col.name === this.collectionName
      );

      if (!collectionExists) {
        // Create collection with optimal configuration
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.vectorDimension,
            distance: 'Cosine', // Cosine similarity for semantic search
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
        });

        // Create payload indexes for efficient filtering
        await this.createPayloadIndexes();

        console.log(`Created Qdrant collection: ${this.collectionName}`);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing Qdrant collection:', error);
      throw new Error(`Failed to initialize Qdrant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create indexes on payload fields for faster filtering
   */
  private async createPayloadIndexes(): Promise<void> {
    const indexes = [
      { field: 'projectId', type: 'keyword' as const },
      { field: 'userId', type: 'keyword' as const },
      { field: 'type', type: 'keyword' as const },
      { field: 'timestamp', type: 'integer' as const },
    ];

    for (const index of indexes) {
      try {
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: index.field,
          field_schema: index.type,
        });
      } catch (error) {
        // Ignore errors if index already exists
        console.warn(`Could not create index for ${index.field}:`, error);
      }
    }
  }

  /**
   * Add a single document chunk to the vector store
   */
  async addChunk(chunk: DocumentChunk): Promise<void> {
    await this.initialize();

    if (!chunk.embedding || chunk.embedding.length === 0) {
      throw new Error('Chunk must have an embedding');
    }

    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: chunk.id,
            vector: chunk.embedding,
            payload: {
              content: chunk.content,
              projectId: chunk.metadata.projectId || null,
              userId: chunk.metadata.userId || null,
              sourceFile: chunk.metadata.sourceFile || null,
              chunkIndex: chunk.metadata.chunkIndex,
              timestamp: chunk.metadata.timestamp,
              type: chunk.metadata.type,
            },
          },
        ],
      });
    } catch (error) {
      console.error('Error adding chunk to Qdrant:', error);
      throw new Error(`Failed to add chunk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add multiple chunks in batch for better performance
   */
  async addChunks(chunks: DocumentChunk[]): Promise<void> {
    await this.initialize();

    if (chunks.length === 0) return;

    // Validate all chunks have embeddings
    const invalidChunks = chunks.filter(c => !c.embedding || c.embedding.length === 0);
    if (invalidChunks.length > 0) {
      throw new Error(`${invalidChunks.length} chunks missing embeddings`);
    }

    try {
      // Batch upload for efficiency
      const batchSize = 100; // Qdrant recommended batch size
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        
        await this.client.upsert(this.collectionName, {
          wait: true,
          points: batch.map(chunk => ({
            id: chunk.id,
            vector: chunk.embedding!,
            payload: {
              content: chunk.content,
              projectId: chunk.metadata.projectId || null,
              userId: chunk.metadata.userId || null,
              sourceFile: chunk.metadata.sourceFile || null,
              chunkIndex: chunk.metadata.chunkIndex,
              timestamp: chunk.metadata.timestamp,
              type: chunk.metadata.type,
            },
          })),
        });
      }

      console.log(`Successfully added ${chunks.length} chunks to Qdrant`);
    } catch (error) {
      console.error('Error adding chunks to Qdrant:', error);
      throw new Error(`Failed to add chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for similar chunks using vector similarity
   */
  async search(
    queryEmbedding: number[],
    options: {
      topK?: number;
      minScore?: number;
      filter?: Partial<DocumentChunk['metadata']>;
    } = {}
  ): Promise<SearchResult[]> {
    await this.initialize();

    const { topK = 5, minScore = 0.5, filter } = options;

    try {
      // Build Qdrant filter
      const qdrantFilter = this.buildFilter(filter);

      // Perform vector search
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: topK,
        score_threshold: minScore,
        filter: qdrantFilter,
        with_payload: true,
      });

      // Convert Qdrant results to SearchResult format
      const results: SearchResult[] = searchResult.map(point => {
        const payload = point.payload as any;
        
        return {
          chunk: {
            id: String(point.id),
            content: payload.content,
            embedding: undefined, // Don't return embeddings in search results
            metadata: {
              projectId: payload.projectId,
              userId: payload.userId,
              sourceFile: payload.sourceFile,
              chunkIndex: payload.chunkIndex,
              timestamp: payload.timestamp,
              type: payload.type,
            },
          },
          score: point.score,
        };
      });

      return results;
    } catch (error) {
      console.error('Error searching Qdrant:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build Qdrant filter from metadata
   */
  private buildFilter(filter?: Partial<DocumentChunk['metadata']>): any {
    if (!filter) return undefined;

    const conditions: any[] = [];

    if (filter.projectId) {
      conditions.push({
        key: 'projectId',
        match: { value: filter.projectId },
      });
    }

    if (filter.userId) {
      conditions.push({
        key: 'userId',
        match: { value: filter.userId },
      });
    }

    if (filter.type) {
      conditions.push({
        key: 'type',
        match: { value: filter.type },
      });
    }

    if (conditions.length === 0) return undefined;

    return {
      must: conditions,
    };
  }

  /**
   * Load chunks for a specific project (pre-load for better performance)
   */
  async loadProjectChunks(projectId: string): Promise<void> {
    // With Qdrant, we don't need to pre-load chunks into memory
    // Filtering is done efficiently at query time
    // This method is kept for interface compatibility
    console.log(`Qdrant will filter by projectId at query time: ${projectId}`);
  }

  /**
   * Delete chunks by project ID
   */
  async deleteProjectChunks(projectId: string): Promise<void> {
    await this.initialize();

    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: 'projectId',
              match: { value: projectId },
            },
          ],
        },
      });

      console.log(`Deleted all chunks for project: ${projectId}`);
    } catch (error) {
      console.error('Error deleting project chunks:', error);
      throw new Error(`Failed to delete project chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a specific chunk by ID
   */
  async deleteChunk(chunkId: string): Promise<void> {
    await this.initialize();

    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        points: [chunkId],
      });
    } catch (error) {
      console.error('Error deleting chunk:', error);
      throw new Error(`Failed to delete chunk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all chunks (use with caution!)
   */
  async clear(): Promise<void> {
    await this.initialize();

    try {
      // Delete and recreate collection
      await this.client.deleteCollection(this.collectionName);
      this.initialized = false;
      await this.initialize();
      
      console.log(`Cleared all data from collection: ${this.collectionName}`);
    } catch (error) {
      console.error('Error clearing Qdrant collection:', error);
      throw new Error(`Failed to clear collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get collection statistics
   */
  async getStats(): Promise<{
    totalChunks: number;
    vectorDimension: number;
    indexedFields: string[];
  }> {
    await this.initialize();

    try {
      const info = await this.client.getCollection(this.collectionName);
      
      return {
        totalChunks: info.points_count || 0,
        vectorDimension: this.vectorDimension,
        indexedFields: ['projectId', 'userId', 'type', 'timestamp'],
      };
    } catch (error) {
      console.error('Error getting Qdrant stats:', error);
      return {
        totalChunks: 0,
        vectorDimension: this.vectorDimension,
        indexedFields: [],
      };
    }
  }

  /**
   * Get total number of chunks
   */
  async size(): Promise<number> {
    const stats = await this.getStats();
    return stats.totalChunks;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      console.error('Qdrant health check failed:', error);
      return false;
    }
  }
}
