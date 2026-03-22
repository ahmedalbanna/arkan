/**
 * Admin RAG Test API
 * 
 * Test RAG queries with full control and detailed results
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

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

    const controller = container.resolve(RagController);

    let cacheHit = false;
    if (useCache) {
      const cacheHitResult = await controller.isSearchCacheHit(query, { projectId, topK, minScore });
      if (cacheHitResult.isSuccess) {
        cacheHit = cacheHitResult.getValue();
      }
    }

    const result = await controller.retrieveContext(query, {
      projectId,
      topK,
      minScore,
      useCache,
      rerank,
      rerankStrategy,
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

    return NextResponse.json({
      ...data,
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
