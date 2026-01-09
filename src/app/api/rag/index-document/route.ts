/**
 * API Route: Index Document for RAG
 * 
 * POST /api/rag/index-document
 * 
 * Allows users to upload and index documents for RAG retrieval.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import RAGService from '@/services/rag-service';

const IndexDocumentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  fileName: z.string().min(1, 'File name is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().optional(),
  type: z.enum(['user_upload', 'reference']).default('user_upload'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validation = IndexDocumentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, fileName, userId, projectId, type } = validation.data;

    // Index the document
    let result;
    if (type === 'reference') {
      result = await RAGService.indexReferenceMaterial(
        content,
        fileName,
        userId,
        projectId
      );
    } else {
      result = await RAGService.indexUserDocument(
        content,
        fileName,
        userId,
        projectId
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to index document', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document indexed successfully',
      chunksCreated: result.chunksCreated,
    });

  } catch (error) {
    console.error('Error in index-document API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
