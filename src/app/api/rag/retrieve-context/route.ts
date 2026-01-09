/**
 * API Route: Retrieve RAG Context
 * 
 * POST /api/rag/retrieve-context
 * 
 * Retrieves relevant context from the vector store for a given query.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import RAGService from '@/services/rag-service';

const RetrieveContextSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectId: z.string().optional(),
  topK: z.number().min(1).max(20).default(5),
  minScore: z.number().min(0).max(1).default(0.5),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validation = RetrieveContextSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { query, userId, projectId, topK, minScore } = validation.data;

    // Retrieve context
    const result = await RAGService.getRelevantContext(
      query,
      projectId || userId, // Use projectId if available, otherwise userId
      userId,
      { topK, minScore }
    );

    return NextResponse.json({
      success: true,
      context: result.context,
      sources: result.sources,
      sourcesCount: result.sources.length,
    });

  } catch (error) {
    console.error('Error in retrieve-context API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
