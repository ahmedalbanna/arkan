/**
 * Demo Search API
 * Handles search requests for the demo interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext } from '@/modules/rag/infrastructure/retrieval';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 5, minScore = 0.5, useCache = true, rerank = false } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Check if it will be a cache hit (for demo purposes)
    let cacheHit = false;
    if (useCache) {
      const { getCacheManager } = await import('@/modules/rag/infrastructure/cache');
      const cache = getCacheManager().getSearchCache();
      cacheHit = cache.getResults(query, { topK, minScore }) !== null;
    }

    // Perform search
    const result = await retrieveContext(query, {
      topK,
      minScore,
      useCache,
      rerank,
      rerankStrategy: 'hybrid',
    });

    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      ...result,
      searchTime,
      cacheHit,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Demo search error:', error);
    
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
