
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

const IndexDocumentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  fileName: z.string().min(1, 'File name is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().optional(),
  type: z.enum(['user_upload', 'reference']).default('user_upload'),
});

import { handleRagResult } from '@/lib/utils/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = IndexDocumentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { content, fileName, ...options } = validation.data;
    const controller = container.resolve(RagController);
    const result = await controller.indexDocument(content, {
        ...options,
        sourceFile: fileName,
    });

    if (result.isFailure) {
        return handleRagResult(result);
    }

    const data = result.getValue();

    return NextResponse.json({
      success: true,
      message: 'Document indexed successfully',
      chunksCreated: data.chunksCreated,
    });

  } catch (error) {
    console.error('Error in index-document API:', error);
    return NextResponse.json({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
