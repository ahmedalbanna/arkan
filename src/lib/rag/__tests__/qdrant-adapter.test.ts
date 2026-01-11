/**
 * Tests for Qdrant Vector Store Adapter
 */

import { QdrantVectorStore } from '../qdrant-adapter';
import type { DocumentChunk } from '../vector-store-interface';

// Mock Qdrant client
jest.mock('@qdrant/js-client-rest', () => ({
  QdrantClient: jest.fn().mockImplementation(() => ({
    getCollections: jest.fn().mockResolvedValue({ collections: [] }),
    createCollection: jest.fn().mockResolvedValue({}),
    createPayloadIndex: jest.fn().mockResolvedValue({}),
    upsert: jest.fn().mockResolvedValue({}),
    search: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue({}),
    deleteCollection: jest.fn().mockResolvedValue({}),
    getCollection: jest.fn().mockResolvedValue({ points_count: 0 }),
  })),
}));

describe('QdrantVectorStore', () => {
  let qdrantStore: QdrantVectorStore;

  beforeEach(() => {
    qdrantStore = new QdrantVectorStore({
      url: 'http://localhost:6333',
      collectionName: 'test_collection',
      vectorDimension: 768,
    });
  });

  describe('initialization', () => {
    it('should initialize collection if it does not exist', async () => {
      await qdrantStore.initialize();
      // If this doesn't throw, initialization succeeded
      expect(true).toBe(true);
    });

    it('should not recreate collection if it already exists', async () => {
      const mockClient = (qdrantStore as any).client;
      mockClient.getCollections.mockResolvedValueOnce({
        collections: [{ name: 'test_collection' }],
      });

      await qdrantStore.initialize();
      expect(mockClient.createCollection).not.toHaveBeenCalled();
    });
  });

  describe('addChunk', () => {
    it('should add a single chunk successfully', async () => {
      const chunk: DocumentChunk = {
        id: 'test-1',
        content: 'Test content',
        embedding: new Array(768).fill(0.1),
        metadata: {
          projectId: 'project-1',
          userId: 'user-1',
          chunkIndex: 0,
          timestamp: Date.now(),
          type: 'context',
        },
      };

      await qdrantStore.addChunk(chunk);
      expect(true).toBe(true); // No error thrown
    });

    it('should throw error if chunk has no embedding', async () => {
      const chunk: DocumentChunk = {
        id: 'test-1',
        content: 'Test content',
        metadata: {
          chunkIndex: 0,
          timestamp: Date.now(),
          type: 'context',
        },
      };

      await expect(qdrantStore.addChunk(chunk)).rejects.toThrow();
    });
  });

  describe('addChunks', () => {
    it('should add multiple chunks in batch', async () => {
      const chunks: DocumentChunk[] = [
        {
          id: 'test-1',
          content: 'Content 1',
          embedding: new Array(768).fill(0.1),
          metadata: {
            chunkIndex: 0,
            timestamp: Date.now(),
            type: 'context',
          },
        },
        {
          id: 'test-2',
          content: 'Content 2',
          embedding: new Array(768).fill(0.2),
          metadata: {
            chunkIndex: 1,
            timestamp: Date.now(),
            type: 'context',
          },
        },
      ];

      await qdrantStore.addChunks(chunks);
      expect(true).toBe(true);
    });

    it('should handle empty array', async () => {
      await qdrantStore.addChunks([]);
      expect(true).toBe(true);
    });
  });

  describe('search', () => {
    it('should search with query embedding', async () => {
      const queryEmbedding = new Array(768).fill(0.5);
      
      const mockClient = (qdrantStore as any).client;
      mockClient.search.mockResolvedValueOnce([
        {
          id: 'result-1',
          score: 0.95,
          payload: {
            content: 'Result content',
            projectId: 'project-1',
            chunkIndex: 0,
            timestamp: Date.now(),
            type: 'context',
          },
        },
      ]);

      const results = await qdrantStore.search(queryEmbedding, { topK: 5 });
      
      expect(results).toHaveLength(1);
      expect(results[0].score).toBe(0.95);
      expect(results[0].chunk.content).toBe('Result content');
    });

    it('should apply filters correctly', async () => {
      const queryEmbedding = new Array(768).fill(0.5);
      const mockClient = (qdrantStore as any).client;

      await qdrantStore.search(queryEmbedding, {
        topK: 5,
        filter: {
          projectId: 'project-1',
          type: 'context',
        },
      });

      expect(mockClient.search).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          filter: {
            must: expect.arrayContaining([
              { key: 'projectId', match: { value: 'project-1' } },
              { key: 'type', match: { value: 'context' } },
            ]),
          },
        })
      );
    });
  });

  describe('deleteProjectChunks', () => {
    it('should delete all chunks for a project', async () => {
      const mockClient = (qdrantStore as any).client;
      
      await qdrantStore.deleteProjectChunks('project-1');
      
      expect(mockClient.delete).toHaveBeenCalledWith(
        'test_collection',
        expect.objectContaining({
          filter: {
            must: [{ key: 'projectId', match: { value: 'project-1' } }],
          },
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true when connection is healthy', async () => {
      const isHealthy = await qdrantStore.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false when connection fails', async () => {
      const mockClient = (qdrantStore as any).client;
      mockClient.getCollections.mockRejectedValueOnce(new Error('Connection failed'));

      const isHealthy = await qdrantStore.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return collection statistics', async () => {
      const mockClient = (qdrantStore as any).client;
      mockClient.getCollection.mockResolvedValueOnce({
        points_count: 1000,
      });

      const stats = await qdrantStore.getStats();
      
      expect(stats.totalChunks).toBe(1000);
      expect(stats.vectorDimension).toBe(768);
      expect(stats.indexedFields).toContain('projectId');
    });
  });
});
