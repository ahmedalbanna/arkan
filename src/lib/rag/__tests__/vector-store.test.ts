/**
 * Tests for Vector Store
 */

import { beforeEach, describe, it } from 'node:test';
import { VectorStore } from '../vector-store';

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    store = new VectorStore();
    store.clear();
  });

  describe('addChunk', () => {
    it('should add chunk to store', async () => {
      const chunk = {
        id: 'test-1',
        content: 'Test content',
        embedding: [0.1, 0.2, 0.3],
        metadata: {
          projectId: 'proj-1',
          userId: 'user-1',
          chunkIndex: 0,
          timestamp: Date.now(),
          type: 'context' as const,
        },
      };

      await store.addChunk(chunk);
      expect(store.size()).toBe(1);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Add test chunks
      await store.addChunk({
        id: 'chunk-1',
        content: 'Machine learning is a subset of AI',
        embedding: [0.9, 0.1, 0.1],
        metadata: {
          projectId: 'proj-1',
          userId: 'user-1',
          chunkIndex: 0,
          timestamp: Date.now(),
          type: 'reference',
        },
      });

      await store.addChunk({
        id: 'chunk-2',
        content: 'Deep learning uses neural networks',
        embedding: [0.8, 0.2, 0.15],
        metadata: {
          projectId: 'proj-1',
          userId: 'user-1',
          chunkIndex: 1,
          timestamp: Date.now(),
          type: 'reference',
        },
      });

      await store.addChunk({
        id: 'chunk-3',
        content: 'Natural language processing',
        embedding: [0.1, 0.9, 0.1],
        metadata: {
          projectId: 'proj-2',
          userId: 'user-2',
          chunkIndex: 0,
          timestamp: Date.now(),
          type: 'context',
        },
      });
    });

    it('should find similar chunks', async () => {
      const queryEmbedding = [0.85, 0.15, 0.1];
      const results = await store.search(queryEmbedding, { topK: 2 });

      expect(results.length).toBeLessThanOrEqual(2);
      expect(results[0].score).toBeGreaterThan(0);
      // Results should be sorted by score
      if (results.length > 1) {
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      }
    });

    it('should filter by projectId', async () => {
      const queryEmbedding = [0.5, 0.5, 0.1];
      const results = await store.search(queryEmbedding, {
        topK: 10,
        filter: { projectId: 'proj-1' },
      });

      results.forEach(result => {
        expect(result.chunk.metadata.projectId).toBe('proj-1');
      });
    });

    it('should respect minScore threshold', async () => {
      const queryEmbedding = [0.5, 0.5, 0.1];
      const results = await store.search(queryEmbedding, {
        topK: 10,
        minScore: 0.8,
      });

      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should respect topK limit', async () => {
      const queryEmbedding = [0.5, 0.5, 0.1];
      const results = await store.search(queryEmbedding, {
        topK: 1,
        minScore: 0,
      });

      expect(results.length).toBeLessThanOrEqual(1);
    });
  });

  describe('clear', () => {
    it('should clear all chunks', async () => {
      await store.addChunk({
        id: 'test-1',
        content: 'Test',
        embedding: [0.1, 0.2],
        metadata: {
          chunkIndex: 0,
          timestamp: Date.now(),
          type: 'context',
        },
      });

      expect(store.size()).toBe(1);
      store.clear();
      expect(store.size()).toBe(0);
    });
  });
});
