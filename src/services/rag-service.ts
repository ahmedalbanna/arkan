/**
 * RAG Service
 * 
 * High-level service for managing RAG operations in the application.
 * This service provides convenient methods for document indexing and retrieval.
 */

import { indexDocument, indexProjectContext, type IndexingResult } from '@/lib/rag/indexer';
import { retrieveContext, type RetrievalOptions, type RetrievalResult } from '@/lib/rag/retrieval';
import { getVectorStore } from '@/lib/rag/vector-store';

export class RAGService {
  /**
   * Index a user-uploaded document
   */
  static async indexUserDocument(
    content: string,
    fileName: string,
    userId: string,
    projectId?: string
  ): Promise<IndexingResult> {
    return indexDocument(content, {
      userId,
      projectId,
      sourceFile: fileName,
      type: 'user_upload',
      chunkSize: 500,
      overlap: 50,
    });
  }

  /**
   * Index reference materials (PDFs, articles, etc.)
   */
  static async indexReferenceMaterial(
    content: string,
    title: string,
    userId: string,
    projectId?: string
  ): Promise<IndexingResult> {
    return indexDocument(content, {
      userId,
      projectId,
      sourceFile: title,
      type: 'reference',
      chunkSize: 600,
      overlap: 100,
    });
  }

  /**
   * Index generated report sections and chapters
   */
  static async indexGeneratedReport(
    projectId: string,
    userId: string,
    sections: Array<{ title: string; content: string }>,
    chapters?: Array<{ title: string; content: string }>
  ): Promise<IndexingResult> {
    return indexProjectContext(projectId, userId, {
      sections,
      chapters,
    });
  }

  /**
   * Retrieve relevant context for report generation
   */
  static async getRelevantContext(
    query: string,
    projectId: string,
    userId: string,
    options: Partial<RetrievalOptions> = {}
  ): Promise<RetrievalResult> {
    return retrieveContext(query, {
      projectId,
      userId,
      topK: 5,
      minScore: 0.5,
      ...options,
    });
  }

  /**
   * Load project vector data into memory
   */
  static async loadProjectData(projectId: string): Promise<void> {
    const vectorStore = getVectorStore();
    await vectorStore.loadProjectChunks(projectId);
  }

  /**
   * Get statistics about indexed documents
   */
  static getIndexStats(): { totalChunks: number } {
    const vectorStore = getVectorStore();
    return {
      totalChunks: vectorStore.size(),
    };
  }

  /**
   * Clear all indexed data (use with caution!)
   */
  static clearIndex(): void {
    const vectorStore = getVectorStore();
    vectorStore.clear();
  }
}

export default RAGService;
