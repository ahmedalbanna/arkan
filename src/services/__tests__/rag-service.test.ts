/**
 * RAG Service Tests
 * 
 * Tests for RAGService - Critical component for vector database operations
 */

import { RAGService } from '../rag-service';
import * as indexer from '@/lib/rag/indexer';
import * as retrieval from '@/lib/rag/retrieval';
import * as vectorStore from '@/lib/rag/vector-store';

// Mock RAG library modules
jest.mock('@/lib/rag/indexer', () => ({
  indexDocument: jest.fn(),
  indexProjectContext: jest.fn(),
}));

jest.mock('@/lib/rag/retrieval', () => ({
  retrieveContext: jest.fn(),
}));

jest.mock('@/lib/rag/vector-store', () => ({
  getVectorStore: jest.fn(),
}));

describe('RAGService', () => {
  let mockVectorStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockVectorStore = {
      loadProjectChunks: jest.fn().mockResolvedValue(undefined),
      size: jest.fn().mockReturnValue(150),
      clear: jest.fn(),
    };

    (vectorStore.getVectorStore as jest.Mock).mockReturnValue(mockVectorStore);
  });

  // ============================================================================
  // Document Indexing
  // ============================================================================

  describe('indexUserDocument', () => {
    it('should index user-uploaded document successfully', async () => {
      const mockResult = {
        success: true,
        chunksCreated: 10,
        documentId: 'doc_123',
      };

      (indexer.indexDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.indexUserDocument(
        'Document content here...',
        'document.txt',
        'user_123',
        'project_456'
      );

      expect(result).toEqual(mockResult);
      expect(indexer.indexDocument).toHaveBeenCalledWith(
        'Document content here...',
        expect.objectContaining({
          userId: 'user_123',
          projectId: 'project_456',
          sourceFile: 'document.txt',
          type: 'user_upload',
          chunkSize: 500,
          overlap: 50,
        })
      );
    });

    it('should work without projectId', async () => {
      const mockResult = {
        success: true,
        chunksCreated: 5,
        documentId: 'doc_456',
      };

      (indexer.indexDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.indexUserDocument(
        'Content',
        'file.txt',
        'user_123'
      );

      expect(result).toEqual(mockResult);
      expect(indexer.indexDocument).toHaveBeenCalledWith(
        'Content',
        expect.objectContaining({
          userId: 'user_123',
          projectId: undefined,
        })
      );
    });

    it('should use correct chunk settings for user uploads', async () => {
      (indexer.indexDocument as jest.Mock).mockResolvedValue({
        success: true,
        chunksCreated: 3,
      });

      await RAGService.indexUserDocument(
        'Content',
        'upload.pdf',
        'user_123'
      );

      expect(indexer.indexDocument).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          chunkSize: 500,
          overlap: 50,
        })
      );
    });

    it('should handle indexing errors', async () => {
      (indexer.indexDocument as jest.Mock).mockRejectedValue(
        new Error('Indexing failed')
      );

      await expect(
        RAGService.indexUserDocument('Content', 'file.txt', 'user_123')
      ).rejects.toThrow('Indexing failed');
    });
  });

  describe('indexReferenceMaterial', () => {
    it('should index reference material successfully', async () => {
      const mockResult = {
        success: true,
        chunksCreated: 20,
        documentId: 'ref_123',
      };

      (indexer.indexDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.indexReferenceMaterial(
        'Reference material content...',
        'Research Paper Title',
        'user_123',
        'project_456'
      );

      expect(result).toEqual(mockResult);
      expect(indexer.indexDocument).toHaveBeenCalledWith(
        'Reference material content...',
        expect.objectContaining({
          userId: 'user_123',
          projectId: 'project_456',
          sourceFile: 'Research Paper Title',
          type: 'reference',
          chunkSize: 600,
          overlap: 100,
        })
      );
    });

    it('should use larger chunks for reference materials', async () => {
      (indexer.indexDocument as jest.Mock).mockResolvedValue({
        success: true,
        chunksCreated: 15,
      });

      await RAGService.indexReferenceMaterial(
        'Content',
        'Reference',
        'user_123'
      );

      expect(indexer.indexDocument).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          chunkSize: 600,
          overlap: 100,
        })
      );
    });

    it('should work without projectId', async () => {
      const mockResult = {
        success: true,
        chunksCreated: 8,
      };

      (indexer.indexDocument as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.indexReferenceMaterial(
        'Content',
        'Title',
        'user_123'
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('indexGeneratedReport', () => {
    it('should index report sections and chapters', async () => {
      const mockResult = {
        success: true,
        chunksCreated: 25,
        documentId: 'report_123',
      };

      const sections = [
        { title: 'Introduction', content: 'Intro content...' },
        { title: 'Methodology', content: 'Method content...' },
      ];

      const chapters = [
        { title: 'Chapter 1', content: 'Chapter 1 content...' },
        { title: 'Chapter 2', content: 'Chapter 2 content...' },
      ];

      (indexer.indexProjectContext as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.indexGeneratedReport(
        'project_123',
        'user_456',
        sections,
        chapters
      );

      expect(result).toEqual(mockResult);
      expect(indexer.indexProjectContext).toHaveBeenCalledWith(
        'project_123',
        'user_456',
        {
          sections,
          chapters,
        }
      );
    });

    it('should work without chapters', async () => {
      const mockResult = {
        success: true,
        chunksCreated: 10,
      };

      const sections = [
        { title: 'Section 1', content: 'Content...' },
      ];

      (indexer.indexProjectContext as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.indexGeneratedReport(
        'project_123',
        'user_456',
        sections
      );

      expect(result).toEqual(mockResult);
      expect(indexer.indexProjectContext).toHaveBeenCalledWith(
        'project_123',
        'user_456',
        {
          sections,
          chapters: undefined,
        }
      );
    });

    it('should handle empty sections array', async () => {
      const mockResult = {
        success: true,
        chunksCreated: 0,
      };

      (indexer.indexProjectContext as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.indexGeneratedReport(
        'project_123',
        'user_456',
        []
      );

      expect(result).toEqual(mockResult);
    });

    it('should handle indexing errors', async () => {
      (indexer.indexProjectContext as jest.Mock).mockRejectedValue(
        new Error('Context indexing failed')
      );

      await expect(
        RAGService.indexGeneratedReport('project_123', 'user_456', [])
      ).rejects.toThrow('Context indexing failed');
    });
  });

  // ============================================================================
  // Context Retrieval
  // ============================================================================

  describe('getRelevantContext', () => {
    it('should retrieve relevant context successfully', async () => {
      const mockResult = {
        chunks: [
          {
            content: 'Relevant chunk 1',
            score: 0.85,
            metadata: { source: 'doc1.txt' },
          },
          {
            content: 'Relevant chunk 2',
            score: 0.78,
            metadata: { source: 'doc2.txt' },
          },
        ],
        query: 'test query',
        totalResults: 2,
      };

      (retrieval.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.getRelevantContext(
        'What is machine learning?',
        'project_123',
        'user_456'
      );

      expect(result).toEqual(mockResult);
      expect(retrieval.retrieveContext).toHaveBeenCalledWith(
        'What is machine learning?',
        expect.objectContaining({
          projectId: 'project_123',
          userId: 'user_456',
          topK: 5,
          minScore: 0.5,
        })
      );
    });

    it('should use default options', async () => {
      const mockResult = {
        chunks: [],
        query: 'test',
        totalResults: 0,
      };

      (retrieval.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

      await RAGService.getRelevantContext(
        'query',
        'project_123',
        'user_456'
      );

      expect(retrieval.retrieveContext).toHaveBeenCalledWith(
        'query',
        expect.objectContaining({
          topK: 5,
          minScore: 0.5,
        })
      );
    });

    it('should allow custom options', async () => {
      const mockResult = {
        chunks: [],
        query: 'test',
        totalResults: 0,
      };

      (retrieval.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

      await RAGService.getRelevantContext(
        'query',
        'project_123',
        'user_456',
        {
          topK: 10,
          minScore: 0.7,
          rerank: true,
        }
      );

      expect(retrieval.retrieveContext).toHaveBeenCalledWith(
        'query',
        expect.objectContaining({
          topK: 10,
          minScore: 0.7,
          rerank: true,
        })
      );
    });

    it('should handle retrieval errors', async () => {
      (retrieval.retrieveContext as jest.Mock).mockRejectedValue(
        new Error('Retrieval failed')
      );

      await expect(
        RAGService.getRelevantContext('query', 'project_123', 'user_456')
      ).rejects.toThrow('Retrieval failed');
    });

    it('should return empty results when no matches', async () => {
      const mockResult = {
        chunks: [],
        query: 'obscure query',
        totalResults: 0,
      };

      (retrieval.retrieveContext as jest.Mock).mockResolvedValue(mockResult);

      const result = await RAGService.getRelevantContext(
        'obscure query',
        'project_123',
        'user_456'
      );

      expect(result.chunks).toHaveLength(0);
      expect(result.totalResults).toBe(0);
    });
  });

  // ============================================================================
  // Vector Store Management
  // ============================================================================

  describe('loadProjectData', () => {
    it('should load project data into memory', async () => {
      await RAGService.loadProjectData('project_123');

      expect(mockVectorStore.loadProjectChunks).toHaveBeenCalledWith('project_123');
    });

    it('should handle loading errors', async () => {
      mockVectorStore.loadProjectChunks.mockRejectedValue(
        new Error('Load failed')
      );

      await expect(
        RAGService.loadProjectData('project_123')
      ).rejects.toThrow('Load failed');
    });

    it('should work with different project IDs', async () => {
      await RAGService.loadProjectData('project_abc');
      await RAGService.loadProjectData('project_xyz');

      expect(mockVectorStore.loadProjectChunks).toHaveBeenCalledTimes(2);
      expect(mockVectorStore.loadProjectChunks).toHaveBeenCalledWith('project_abc');
      expect(mockVectorStore.loadProjectChunks).toHaveBeenCalledWith('project_xyz');
    });
  });

  describe('getIndexStats', () => {
    it('should return index statistics', () => {
      mockVectorStore.size.mockReturnValue(250);

      const stats = RAGService.getIndexStats();

      expect(stats).toEqual({
        totalChunks: 250,
      });
      expect(mockVectorStore.size).toHaveBeenCalled();
    });

    it('should return 0 for empty index', () => {
      mockVectorStore.size.mockReturnValue(0);

      const stats = RAGService.getIndexStats();

      expect(stats.totalChunks).toBe(0);
    });

    it('should reflect current index size', () => {
      // First call
      mockVectorStore.size.mockReturnValue(100);
      expect(RAGService.getIndexStats().totalChunks).toBe(100);

      // After indexing more documents
      mockVectorStore.size.mockReturnValue(200);
      expect(RAGService.getIndexStats().totalChunks).toBe(200);
    });
  });

  describe('clearIndex', () => {
    it('should clear all indexed data', () => {
      RAGService.clearIndex();

      expect(mockVectorStore.clear).toHaveBeenCalled();
    });

    it('should be callable multiple times', () => {
      RAGService.clearIndex();
      RAGService.clearIndex();
      RAGService.clearIndex();

      expect(mockVectorStore.clear).toHaveBeenCalledTimes(3);
    });

    it('should not throw if clear fails', () => {
      mockVectorStore.clear.mockImplementation(() => {
        throw new Error('Clear failed');
      });

      expect(() => RAGService.clearIndex()).toThrow('Clear failed');
    });
  });

  // ============================================================================
  // Integration Scenarios
  // ============================================================================

  describe('Integration scenarios', () => {
    it('should handle complete document lifecycle', async () => {
      // Index document
      (indexer.indexDocument as jest.Mock).mockResolvedValue({
        success: true,
        chunksCreated: 10,
        documentId: 'doc_123',
      });

      const indexResult = await RAGService.indexUserDocument(
        'Document content',
        'document.txt',
        'user_123',
        'project_456'
      );

      expect(indexResult.success).toBe(true);

      // Retrieve context
      (retrieval.retrieveContext as jest.Mock).mockResolvedValue({
        chunks: [
          { content: 'Chunk 1', score: 0.9, metadata: {} },
        ],
        query: 'test',
        totalResults: 1,
      });

      const retrievalResult = await RAGService.getRelevantContext(
        'test query',
        'project_456',
        'user_123'
      );

      expect(retrievalResult.chunks.length).toBeGreaterThan(0);

      // Check stats
      mockVectorStore.size.mockReturnValue(10);
      const stats = RAGService.getIndexStats();
      expect(stats.totalChunks).toBe(10);
    });

    it('should handle multiple document types', async () => {
      (indexer.indexDocument as jest.Mock).mockResolvedValue({
        success: true,
        chunksCreated: 5,
      });

      (indexer.indexProjectContext as jest.Mock).mockResolvedValue({
        success: true,
        chunksCreated: 8,
      });

      // Index user document
      await RAGService.indexUserDocument(
        'User content',
        'user.txt',
        'user_123',
        'project_123'
      );

      // Index reference material
      await RAGService.indexReferenceMaterial(
        'Reference content',
        'Reference Title',
        'user_123',
        'project_123'
      );

      // Index generated report
      await RAGService.indexGeneratedReport(
        'project_123',
        'user_123',
        [{ title: 'Section', content: 'Content' }]
      );

      expect(indexer.indexDocument).toHaveBeenCalledTimes(2);
      expect(indexer.indexProjectContext).toHaveBeenCalledTimes(1);
    });

    it('should handle error recovery', async () => {
      // First attempt fails
      (indexer.indexDocument as jest.Mock).mockRejectedValueOnce(
        new Error('Temporary failure')
      );

      await expect(
        RAGService.indexUserDocument('Content', 'file.txt', 'user_123')
      ).rejects.toThrow('Temporary failure');

      // Second attempt succeeds
      (indexer.indexDocument as jest.Mock).mockResolvedValueOnce({
        success: true,
        chunksCreated: 5,
      });

      const result = await RAGService.indexUserDocument(
        'Content',
        'file.txt',
        'user_123'
      );

      expect(result.success).toBe(true);
    });
  });
});
