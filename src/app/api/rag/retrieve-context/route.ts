
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

const RetrieveContextSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().optional(),
  topK: z.number().min(1).max(20).default(5),
  minScore: z.number().min(0).max(1).default(0.5),
});

import { handleRagResult } from '@/lib/utils/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RetrieveContextSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { query, ...options } = validation.data;
    const controller = container.resolve(RagController);
    const result = await controller.retrieveContext(query, options);

    if (result.isFailure) {
        return handleRagResult(result);
    }

    const data = result.getValue();

    return NextResponse.json({
      success: true,
      context: data.context,
      sources: data.sources,
    });

  } catch (error) {
    console.error('Error in retrieve-context API:', error);
    return NextResponse.json({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
