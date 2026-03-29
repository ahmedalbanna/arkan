
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';
import { handleRagResult, handleApiError } from '@/infrastructure/api/api-utils';

const IndexDocumentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  fileName: z.string().min(1, 'File name is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().optional(),
  type: z.enum(['user_upload', 'reference']).default('user_upload'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = IndexDocumentSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { content, fileName, ...options } = validation.data;
    const controller = container.resolve(RagController);
    const result = await controller.indexDocument(content, {
        ...options,
        sourceFile: fileName,
    });

    return handleRagResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}
