/**
 * RAG Retrieval Service
 * 
 * Optimized for low-latency context synthesis and high-precision recall.
 * Features high-precision telemetry, hybrid reranking guards, and optimized merging.
 */

import { generateEmbedding } from './embeddings';
import { getVectorStore } from './vector-store';
import type { SearchResult } from './vector-store-interface';

export interface RetrievalTelemetry {
  totalTimeMs: number;
  cacheLookupMs: number;
  embeddingTimeMs: number;
  searchTimeMs: number;
  rerankTimeMs: number;
  isCached: boolean;
  rerankSkipped: boolean;
}

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  projectId?: string;
  userId?: string;
  includeTypes?: Array<'report' | 'reference' | 'context' | 'user_upload'>;
  useCache?: boolean;
  rerank?: boolean;
  rerankStrategy?: 'cross-encoder' | 'bm25' | 'hybrid' | 'reciprocal-rank-fusion';
}

export interface RetrievalResult {
  context: string;
  sources: Array<{
    content: string;
    score: number;
    sourceFile?: string;
    type: string;
  }>;
  telemetry?: RetrievalTelemetry;
}

/**
 * Retrieve relevant context for a query using RAG.
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const startTime = performance.now();
  const telemetry: RetrievalTelemetry = {
    totalTimeMs: 0,
    cacheLookupMs: 0,
    embeddingTimeMs: 0,
    searchTimeMs: 0,
    rerankTimeMs: 0,
    isCached: false,
    rerankSkipped: false,
  };

  const {
    topK = 5,
    minScore = 0.45,
    projectId,
    userId,
    includeTypes,
    useCache = true,
    rerank = false,
    rerankStrategy = 'hybrid'
  } = options;

  try {
    // 1. CACHE LOOKUP — Phase 1 Telemetry
    const cacheStartTime = performance.now();
    if (useCache) {
      const { getCacheManager } = await import('./cache');
      const cache = getCacheManager().getSearchCache();
      const cached = cache.getResults(query, { projectId, topK, minScore });
      
      telemetry.cacheLookupMs = performance.now() - cacheStartTime;
      if (cached) {
        telemetry.isCached = true;
        telemetry.totalTimeMs = performance.now() - startTime;
        return { ...cached, telemetry };
      }
    }

    // 2. QUERY EMBEDDING — Phase 2 Telemetry
    const embedStartTime = performance.now();
    const queryEmbedding = await generateEmbedding(query, useCache);
    telemetry.embeddingTimeMs = performance.now() - embedStartTime;

    if (!queryEmbedding.length) {
        return { context: '', sources: [], telemetry };
    }

    // 3. VECTOR SEARCH — Phase 3 Telemetry
    const searchStartTime = performance.now();
    const vectorStore = getVectorStore();
    
    let searchResults = await vectorStore.search(queryEmbedding, {
      topK: rerank ? topK * 3 : topK,
      minScore,
      filter: { projectId, userId, type: includeTypes?.[0] },
    });
    telemetry.searchTimeMs = performance.now() - searchStartTime;

    if (searchResults.length === 0) {
        return { context: '', sources: [], telemetry };
    }

    // 4. RERANKING PIPELINE — Phase 4 Telemetry
    const rerankStartTime = performance.now();
    const needsReranking = rerank && searchResults[0].score < 0.92;

    if (needsReranking) {
      const { getReranker } = await import('./reranker');
      const reranker = getReranker();
      searchResults = await reranker.rerank(query, searchResults, {
        strategy: rerankStrategy,
        topK,
      });
      telemetry.rerankTimeMs = performance.now() - rerankStartTime;
    } else if (rerank) {
        telemetry.rerankSkipped = true;
        searchResults = searchResults.slice(0, topK);
    }

    // 5. SYNTHESIS
    const sources = searchResults.map((result: SearchResult) => ({
      content: result.chunk.content,
      score: result.score,
      sourceFile: result.chunk.metadata.sourceFile,
      type: result.chunk.metadata.type,
    }));

    const context = searchResults
      .map((result: SearchResult, idx: number) => {
        const source = result.chunk.metadata.sourceFile || 'Spectral Source';
        return `[INTEL_NODE_${idx + 1}] (Match: ${(result.score * 100).toFixed(0)}%, Vector: ${source})\n${result.chunk.content.trim()}`;
      })
      .join('\n\n---\n\n');

    const result = { context, sources };

    // 6. CACHE PERSISTENCE
    if (useCache) {
      const { getCacheManager } = await import('./cache');
      const cache = getCacheManager().getSearchCache();
      cache.setResults(query, { projectId, topK, minScore }, result);
    }

    telemetry.totalTimeMs = performance.now() - startTime;
    return { ...result, telemetry };

  } catch (error) {
    console.error('[Retrieval] Context synthesis failure:', error);
    return { context: '', sources: [] };
  }
}

/**
 * Retrieve context for multiple queries in parallel.
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
 * Enhanced retrieval with optimized query expansion.
 */
export async function retrieveContextEnhanced(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const startTime = performance.now();
  
  const queries = [
    query,
    `Technical details and constraints for ${query}`,
    `Academic context and background regarding ${query}`,
  ];

  const results = await retrieveContextBatch(queries, {
    ...options,
    topK: Math.ceil((options.topK || 5) / 1.5),
  });

  const sourceMap = new Map<string, RetrievalResult['sources'][0]>();
  
  for (const r of results) {
    for (const s of r.sources) {
        const existing = sourceMap.get(s.content);
        if (!existing || s.score > existing.score) {
            sourceMap.set(s.content, s);
        }
    }
  }

  const finalSources = Array.from(sourceMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, options.topK || 5);

  const context = finalSources
    .map((source, idx) => {
      return `[SYNC_NODE_${idx + 1}] (Weight: ${(source.score * 100).toFixed(0)}%, Source: ${source.sourceFile || 'Unknown'})\n${source.content.trim()}`;
    })
    .join('\n\n---\n\n');

  return {
    context,
    sources: finalSources,
    telemetry: {
        totalTimeMs: performance.now() - startTime,
        cacheLookupMs: 0,
        embeddingTimeMs: 0,
        searchTimeMs: 0,
        rerankTimeMs: 0,
        isCached: false,
        rerankSkipped: false
    }
  };
}
