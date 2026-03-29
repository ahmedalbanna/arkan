
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';
import { handleRagResult, handleApiError } from '@/infrastructure/api/api-utils';

const RetrieveContextSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().optional(),
  topK: z.number().min(1).max(20).default(5),
  minScore: z.number().min(0).max(1).default(0.5),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RetrieveContextSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { query, ...options } = validation.data;
    const controller = container.resolve(RagController);
    const result = await controller.retrieveContext(query, options);

    return handleRagResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}
