/**
 * Admin RAG Test API
 * 
 * Test RAG queries with full control and detailed results
 */

import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext } from '@/lib/rag/retrieval';
import { getCacheManager } from '@/lib/rag/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      projectId,
      topK = 5,
      minScore = 0.5,
      useCache = true,
      rerank = false,
      rerankStrategy = 'hybrid',
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check if will be cache hit (for reporting)
    let cacheHit = false;
    if (useCache) {
      const cacheManager = getCacheManager();
      const cache = cacheManager.getSearchCache();
      cacheHit = cache.getResults(query, { projectId, topK, minScore }) !== null;
    }

    // Perform search
    const result = await retrieveContext(query, {
      projectId,
      topK,
      minScore,
      useCache,
      rerank,
      rerankStrategy,
    });

    return NextResponse.json({
      ...result,
      cacheHit,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('RAG test error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Search failed',
        sources: [],
        context: '',
      },
      { status: 500 }
    );
  }
}
