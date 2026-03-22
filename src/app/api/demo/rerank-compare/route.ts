/**
 * Demo Re-ranking Comparison API
 * Compare different re-ranking strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, strategy = 'all' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const controller = container.resolve(RagController);
    const result = await controller.compareReranking(query, strategy);

    if (result.isFailure) {
      return NextResponse.json(
        {
          error: result.error?.message ?? 'Comparison failed',
          comparisons: [],
        },
        { status: 400 }
      );
    }

    const data = result.getValue();

    if (data.initialResultCount === 0) {
      return NextResponse.json({
        comparisons: [],
        message: 'No results found for comparison',
      });
    }

    return NextResponse.json({
      comparisons: data.comparisons,
      initialResultCount: data.initialResultCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Re-ranking comparison error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Comparison failed',
        comparisons: [],
      },
      { status: 500 }
    );
  }
}
