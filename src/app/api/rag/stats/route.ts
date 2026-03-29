
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';
import { handleRagResult, handleApiError } from '@/infrastructure/api/api-utils';

export async function GET(_request: NextRequest) {
  try {
    const controller = container.resolve(RagController);
    const result = await controller.getStats();

    if (result.isFailure) {
        return handleRagResult(result);
    }

    const stats = result.getValue();
    const totalChunks = stats.totalChunks;

    // Mock project data for now (in production, track this separately)
    const projects = [
      { projectId: 'test-ai-project', count: Math.floor(totalChunks * 0.4) },
      { projectId: 'test-web-project', count: Math.floor(totalChunks * 0.35) },
      { projectId: 'test-db-project', count: Math.floor(totalChunks * 0.25) },
    ].filter(p => p.count > 0);

    // Mock activity data (in production, track in analytics)
    const recentActivity = {
      indexing: Math.floor(Math.random() * 50) + 10,
      retrieval: Math.floor(Math.random() * 100) + 50,
      avgSearchTime: Math.floor(Math.random() * 50) + 30,
    };

    return NextResponse.json({
      totalChunks,
      projects,
      averageChunkSize: 300,
      recentActivity,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return handleApiError(error);
  }
}
