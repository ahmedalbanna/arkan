/**
 * Document Statistics API
 * 
 * Get comprehensive statistics about indexed documents
 */

import { handleApiError, handleRagResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

export async function GET() {
  try {
    const controller = container.resolve(RagController);
    const result = await controller.getStats();
    return handleRagResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}
