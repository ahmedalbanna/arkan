/**
 * Qdrant Vector Database Adapter
 * 
 * This adapter implements the VectorStore interface using Qdrant as the backend.
 * Optimized for low-latency initialization and high-throughput point ingestion.
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import type { DocumentChunk, SearchResult } from './vector-store-interface';

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
  private initPromise: Promise<void> | null = null;

  constructor(config: QdrantConfig) {
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
    });
    this.collectionName = config.collectionName;
    this.vectorDimension = config.vectorDimension;
  }

  /**
   * Initialize the collection if it doesn't exist.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
        try {
            const collections = await this.client.getCollections();
            const collectionExists = collections.collections.some(
                (col) => col.name === this.collectionName
            );

            if (!collectionExists) {
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorDimension,
                        distance: 'Cosine',
                    },
                    optimizers_config: {
                        default_segment_number: 2,
                        indexing_threshold: 10000,
                    },
                    replication_factor: 1,
                });

                await this.createPayloadIndexes();
                console.log(`[Qdrant] Collection synthesized: ${this.collectionName}`);
            }

            this.initialized = true;
        } catch (error) {
            this.initPromise = null;
            console.error('[Qdrant] Initialization failure:', error);
            throw new Error(`Failed to initialize Qdrant: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    })();

    return this.initPromise;
  }

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
        // Silently handle
      }
    }
  }

  async addChunk(chunk: DocumentChunk): Promise<void> {
    await this.initialize();

    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: chunk.id,
            vector: chunk.embedding!, // Force since we assume embeddings generated
            payload: {
              content: chunk.content,
              ...chunk.metadata,
              timestamp: Date.now(),
            },
          },
        ],
      });
    } catch (error) {
      console.error('[Qdrant] Upsert failure:', error);
      throw error;
    }
  }

  async addChunks(chunks: DocumentChunk[]): Promise<void> {
    if (!chunks.length) return;
    await this.initialize();

    try {
      const points = chunks.map((chunk) => ({
        id: chunk.id,
        vector: chunk.embedding!, // Force since we assume embeddings generated
        payload: {
          content: chunk.content,
          ...chunk.metadata,
          timestamp: Date.now(),
        },
      }));

      await this.client.upsert(this.collectionName, {
        wait: true,
        points,
      });
    } catch (error) {
      console.error('[Qdrant] Batch ingestion failure:', error);
      throw error;
    }
  }

  async search(
    queryEmbedding: number[],
    options: { topK?: number; minScore?: number; filter?: any } = {}
  ): Promise<SearchResult[]> {
    await this.initialize();

    try {
      const { topK = 5, minScore = 0.5, filter } = options;

      const qdrantFilter = this.buildFilter(filter);

      const results = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: topK,
        filter: qdrantFilter,
        with_payload: true,
        score_threshold: minScore,
      });

      return results.map((res) => ({
        chunk: {
          id: String(res.id),
          content: (res.payload?.content as string) || '',
          embedding: [],
          metadata: {
            projectId: (res.payload?.projectId as string) || '',
            userId: (res.payload?.userId as string) || '',
            sourceFile: (res.payload?.sourceFile as string) || '',
            type: (res.payload?.type as any) || 'context',
            chunkIndex: (res.payload?.chunkIndex as number) || 0,
            timestamp: (res.payload?.timestamp as number) || Date.now(),
          },
        },
        score: res.score,
      }));
    } catch (error) {
      console.error('[Qdrant] Search failure:', error);
      return [];
    }
  }

  private buildFilter(filter?: any): any {
    if (!filter) return undefined;

    const must: any[] = [];

    if (filter.projectId) {
      must.push({ key: 'projectId', match: { value: filter.projectId } });
    }
    if (filter.userId) {
      must.push({ key: 'userId', match: { value: filter.userId } });
    }
    if (filter.type) {
      must.push({ key: 'type', match: { value: filter.type } });
    }

    return must.length > 0 ? { must } : undefined;
  }

  async loadProjectChunks(projectId: string): Promise<void> {
    // Kept for interface compatibility
  }

  async deleteProjectChunks(projectId: string): Promise<void> {
    await this.initialize();

    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        filter: {
          must: [{ key: 'projectId', match: { value: projectId } }],
        },
      });
    } catch (error) {
      console.error('[Qdrant] Project removal failure:', error);
    }
  }

  async deleteChunk(chunkId: string): Promise<void> {
    await this.initialize();
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        points: [chunkId],
      });
    } catch (error) {
      console.error('[Qdrant] Node removal failure:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.deleteCollection(this.collectionName);
      this.initialized = false;
      this.initPromise = null;
    } catch (error) {
      console.error('[Qdrant] Collection clearing failed:', error);
    }
  }

  async getStats(): Promise<any> {
    await this.initialize();
    try {
      const collectionInfo = await this.client.getCollection(this.collectionName);
      return {
        count: collectionInfo.points_count || 0,
        status: collectionInfo.status,
        vectors: collectionInfo.indexed_vectors_count || 0,
      };
    } catch (error) {
      return { count: 0, status: 'error' };
    }
  }

  async size(): Promise<number> {
    const stats = await this.getStats();
    return stats.count;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const collections = await this.client.getCollections();
      return collections.collections.some(c => c.name === this.collectionName);
    } catch (e) {
      return false;
    }
  }
}
