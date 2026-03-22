/**
 * Demo Search API
 * Handles search requests for the demo interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

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

    const controller = container.resolve(RagController);
    const startTime = Date.now();

    let cacheHit = false;
    if (useCache) {
      const cacheHitResult = await controller.isSearchCacheHit(query, { topK, minScore });
      if (cacheHitResult.isSuccess) {
        cacheHit = cacheHitResult.getValue();
      }
    }

    const result = await controller.retrieveContext(query, {
      topK,
      minScore,
      useCache,
      rerank,
      rerankStrategy: 'hybrid',
    });

    if (result.isFailure) {
      return NextResponse.json(
        {
          error: result.error?.message ?? 'Search failed',
          sources: [],
          context: '',
        },
        { status: 400 }
      );
    }

    const data = result.getValue();
    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      ...data,
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
