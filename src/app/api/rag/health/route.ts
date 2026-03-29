
/**
 * RAG Health Check API Endpoint
 */

import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';
import { handleRagResult, handleApiError } from '@/infrastructure/api/api-utils';

export async function GET(_request: NextRequest) {
  try {
    const controller = container.resolve(RagController);
    const result = await controller.getHealthStatus();

    return handleRagResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}
