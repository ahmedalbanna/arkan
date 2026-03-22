/**
 * Demo Cache Statistics API
 * Get and manage cache statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';
import { handleRagResult } from '@/lib/utils/api-utils';

export async function GET(_request: NextRequest) {
  try {
    const controller = container.resolve(RagController);
    const result = await controller.getCacheStats();
    return handleRagResult(result);
  } catch (error) {
    console.error('Error fetching cache stats:', error);

    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const controller = container.resolve(RagController);
    const result = await controller.clearCache();

    if (result.isFailure) {
      return handleRagResult(result);
    }

    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    console.error('Error clearing cache:', error);

    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
