/**
 * Indexed Documents Management API
 * 
 * Get and manage indexed documents using Firestore tracking
 */

import { NextRequest } from 'next/server';
import { handleApiError, handleRagResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';
import { Result } from '@/infrastructure/utils/result';

export async function GET(_request: NextRequest) {
  try {
    const controller = container.resolve(RagController);
    const documentsResult = await controller.getIndexedDocuments();
    const statsResult = await controller.getStats();

    if (documentsResult.isFailure) {
      return handleRagResult(documentsResult);
    }

    if (statsResult.isFailure) {
      return handleRagResult(statsResult);
    }

    return handleRagResult(Result.ok({
      documents: documentsResult.getValue(),
      ...statsResult.getValue(),
      timestamp: new Date().toISOString(),
    }));

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return handleApiError({ message: 'Project ID is required' }, 400);
    }

    const controller = container.resolve(RagController);
    const result = await controller.deleteIndexedDocument({ projectId });

    return handleRagResult(result);

  } catch (error) {
    return handleApiError(error);
  }
}
