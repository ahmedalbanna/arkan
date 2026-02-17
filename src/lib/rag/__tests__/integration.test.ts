/**
 * Integration Tests for RAG System with Qdrant
 * 
 * These tests verify the full RAG pipeline:
 * 1. Document indexing
 * 2. Vector storage
 * 3. Context retrieval
 * 4. Search functionality
 * 
 * Note: These tests require a running Qdrant instance
 */

import { indexDocument } from '../indexer';
import { retrieveContext } from '../retrieval';
import { getVectorStore, resetVectorStore } from '../vector-store';
import { beforeEach, describe, it } from 'node:test';

// Skip these tests if Qdrant is not available
const QDRANT_AVAILABLE = process.env.VECTOR_STORE_PROVIDER === 'qdrant';

describe.skip('RAG Integration Tests with Qdrant', () => {
  // Only run if Qdrant is configured
  if (!QDRANT_AVAILABLE) {
    it.skip('Qdrant not configured - skipping integration tests', () => {});
    return;
  }

  beforeEach(() => {
    resetVectorStore();
  });

  describe('Document Indexing and Retrieval', () => {
    it('should index a document and retrieve relevant context', async () => {
      const testDocument = `
        Artificial Intelligence (AI) is transforming the world of technology.
        Machine learning algorithms enable computers to learn from data.
        Deep learning uses neural networks with multiple layers.
        Natural language processing helps computers understand human language.
      `;

      // Index the document
      const result = await indexDocument(testDocument, {
        projectId: 'test-project-1',
        userId: 'test-user-1',
        type: 'context',
        chunkSize: 100,
      });

      expect(result.success).toBe(true);
      expect(result.chunksCreated).toBeGreaterThan(0);

      // Wait a bit for indexing to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Retrieve context
      const retrieval = await retrieveContext('What is machine learning?', {
        projectId: 'test-project-1',
        topK: 3,
        minScore: 0.3,
      });

      expect(retrieval.sources.length).toBeGreaterThan(0);
      expect(retrieval.context).toContain('machine learning');
    }, 15000);

    it('should filter results by project ID', async () => {
      // Index documents for different projects
      await indexDocument('Project A content about databases', {
        projectId: 'project-a',
        type: 'context',
      });

      await indexDocument('Project B content about machine learning', {
        projectId: 'project-b',
        type: 'context',
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Search in project A
      const resultsA = await retrieveContext('databases', {
        projectId: 'project-a',
        topK: 5,
      });

      // Results should be from project A
      resultsA.sources.forEach(source => {
        expect(source.content).toContain('Project A');
      });
    }, 15000);
  });

  describe('Vector Store Operations', () => {
    it('should handle large batch indexing', async () => {
      const documents = Array.from({ length: 50 }, (_, i) => ({
        content: `This is test document ${i} with some content about topic ${i % 10}.`,
        options: {
          projectId: 'batch-test',
          type: 'context' as const,
        },
      }));

      const results = await Promise.all(
        documents.map(doc => indexDocument(doc.content, doc.options))
      );

      const successful = results.filter(r => r.success).length;
      expect(successful).toBe(documents.length);

      const vectorStore = getVectorStore();
      if (typeof vectorStore.getStats === 'function') {
        const stats = await vectorStore.getStats();
        expect(stats.totalChunks).toBeGreaterThan(0);
      }
    }, 30000);

    it('should delete project chunks', async () => {
      await indexDocument('Test document for deletion', {
        projectId: 'delete-test',
        type: 'context',
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const vectorStore = getVectorStore();
      if (typeof vectorStore.deleteProjectChunks === 'function') {
        await vectorStore.deleteProjectChunks('delete-test');

        // Verify deletion
        const retrieval = await retrieveContext('test document', {
          projectId: 'delete-test',
          topK: 5,
        });

        expect(retrieval.sources.length).toBe(0);
      }
    }, 15000);
  });

  describe('Search Quality', () => {
    beforeAll(async () => {
      // Index test documents with known content
      const testDocs = [
        {
          content: 'Python is a high-level programming language known for its simplicity.',
          metadata: { sourceFile: 'python-intro.txt' },
        },
        {
          content: 'JavaScript is primarily used for web development and runs in browsers.',
          metadata: { sourceFile: 'js-intro.txt' },
        },
        {
          content: 'React is a JavaScript library for building user interfaces.',
          metadata: { sourceFile: 'react-intro.txt' },
        },
      ];

      for (const doc of testDocs) {
        await indexDocument(doc.content, {
          projectId: 'search-quality-test',
          sourceFile: doc.metadata.sourceFile,
          type: 'context',
        });
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    it('should return most relevant results first', async () => {
      const retrieval = await retrieveContext('Tell me about JavaScript', {
        projectId: 'search-quality-test',
        topK: 3,
      });

      expect(retrieval.sources.length).toBeGreaterThan(0);
      
      // First result should be about JavaScript
      const firstResult = retrieval.sources[0];
      expect(firstResult.content.toLowerCase()).toContain('javascript');
      
      // Should have high relevance score
      expect(firstResult.score).toBeGreaterThan(0.6);
    }, 15000);
  });
});
