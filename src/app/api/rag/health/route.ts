/**
 * RAG Health Check API Endpoint
 * 
 * Returns the health status of the RAG system including:
 * - Vector store connectivity
 * - Ollama embedding service
 * - Collection statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

export async function GET(_request: NextRequest) {
  try {
    const controller = container.resolve(RagController);
    const result = await controller.getHealthStatus();

    if (result.isFailure) {
      return NextResponse.json(
        {
          status: 'error',
          timestamp: new Date().toISOString(),
          error: result.error?.message ?? 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result.getValue());
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
