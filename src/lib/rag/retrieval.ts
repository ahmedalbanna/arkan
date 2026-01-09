/**
 * RAG Retrieval Service
 * 
 * This module provides the main RAG functionality: retrieving relevant context
 * from the vector store based on a query.
 */

import { generateEmbedding } from './embeddings';
import { getVectorStore, type SearchResult } from './vector-store';

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  projectId?: string;
  userId?: string;
  includeTypes?: Array<'report' | 'reference' | 'context' | 'user_upload'>;
}

export interface RetrievalResult {
  context: string;
  sources: Array<{
    content: string;
    score: number;
    sourceFile?: string;
    type: string;
  }>;
}

/**
 * Retrieve relevant context for a query using RAG
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const {
    topK = 5,
    minScore = 0.5,
    projectId,
    userId,
    includeTypes,
  } = options;

  try {
    // 1. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Search vector store for similar chunks
    const vectorStore = getVectorStore();
    
    // Load project chunks if projectId is provided
    if (projectId) {
      await vectorStore.loadProjectChunks(projectId);
    }

    const searchResults = await vectorStore.search(queryEmbedding, {
      topK,
      minScore,
      filter: {
        projectId,
        userId,
        type: includeTypes?.[0], // Simple filter for now
      },
    });

    // 3. Format results
    const sources = searchResults.map(result => ({
      content: result.chunk.content,
      score: result.score,
      sourceFile: result.chunk.metadata.sourceFile,
      type: result.chunk.metadata.type,
    }));

    // 4. Combine context from top results
    const context = searchResults
      .map((result, idx) => {
        const source = result.chunk.metadata.sourceFile || 'Unknown';
        return `[Context ${idx + 1}] (Relevance: ${(result.score * 100).toFixed(1)}%, Source: ${source})\n${result.chunk.content}`;
      })
      .join('\n\n---\n\n');

    return {
      context,
      sources,
    };
  } catch (error) {
    console.error('Error retrieving context:', error);
    
    // Return empty context on error instead of failing
    return {
      context: '',
      sources: [],
    };
  }
}

/**
 * Retrieve context for multiple queries (batch processing)
 */
export async function retrieveContextBatch(
  queries: string[],
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  return Promise.all(
    queries.map(query => retrieveContext(query, options))
  );
}

/**
 * Enhanced retrieval with query expansion
 * Generates multiple variations of the query to improve recall
 */
export async function retrieveContextEnhanced(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  // Generate query variations
  const queries = [
    query,
    // Add simple variations
    `What is ${query}?`,
    `Explain ${query}`,
  ];

  // Retrieve for all variations
  const results = await retrieveContextBatch(queries, {
    ...options,
    topK: Math.ceil((options.topK || 5) / queries.length),
  });

  // Merge and deduplicate results
  const allSources = results.flatMap(r => r.sources);
  const uniqueSources = Array.from(
    new Map(allSources.map(s => [s.content, s])).values()
  )
    .sort((a, b) => b.score - a.score)
    .slice(0, options.topK || 5);

  const context = uniqueSources
    .map((source, idx) => {
      return `[Context ${idx + 1}] (Relevance: ${(source.score * 100).toFixed(1)}%, Source: ${source.sourceFile || 'Unknown'})\n${source.content}`;
    })
    .join('\n\n---\n\n');

  return {
    context,
    sources: uniqueSources,
  };
}
