/**
 * Admin RAG Test API
 * 
 * Test RAG queries with full control and detailed results
 */

import { NextRequest } from 'next/server';
import { handleApiError, handleRagResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';
import { Result } from '@/infrastructure/utils/result';

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
      return handleApiError({ message: 'Query is required' }, 400);
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
      return handleRagResult(result);
    }

    const data = result.getValue();

    return handleRagResult(Result.ok({
      ...data,
      cacheHit,
      timestamp: new Date().toISOString(),
    }));

  } catch (error) {
    return handleApiError(error);
  }
}
