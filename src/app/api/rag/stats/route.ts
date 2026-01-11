/**
 * RAG Statistics API Endpoint
 * 
 * Returns detailed statistics about the RAG system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/rag/vector-store';

export async function GET(request: NextRequest) {
  try {
    const vectorStore = getVectorStore();

    // Get total chunks
    let totalChunks = 0;
    if (typeof vectorStore.size === 'function') {
      totalChunks = await vectorStore.size();
    } else {
      totalChunks = vectorStore.size();
    }

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
    console.error('Error fetching RAG stats:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}
