/**
 * Document Statistics API
 * 
 * Get comprehensive statistics about indexed documents
 */

import { NextResponse } from 'next/server';
import { getDocumentStatistics } from '@/services/document-tracking-service';
import { getVectorStore } from '@/lib/rag/vector-store';
import { getCacheManager } from '@/lib/rag/cache';

export async function GET() {
  try {
    // Get document tracking stats
    const docStats = await getDocumentStatistics();
    
    // Get Qdrant stats
    const vectorStore = getVectorStore();
    let qdrantStats: Record<string, unknown> = {};
    if (typeof vectorStore.getStats === 'function') {
      qdrantStats = await vectorStore.getStats();
    }

    // Get cache stats
    const cacheManager = getCacheManager();
    const cacheStats = cacheManager.getAllStats();

    return NextResponse.json({
      documents: {
        total: docStats.totalDocuments,
        chunks: docStats.totalChunks,
        projects: docStats.projectCount,
        recent: docStats.recentUploads,
      },
      qdrant: {
        totalChunks: qdrantStats.totalChunks || 0,
        vectorDimension: qdrantStats.vectorDimension || 768,
        indexedFields: qdrantStats.indexedFields || [],
      },
      cache: {
        embeddings: {
          size: cacheStats.embeddings.size,
          hitRate: cacheStats.embeddings.hitRate,
        },
        searches: {
          size: cacheStats.searches.size,
          hitRate: cacheStats.searches.hitRate,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
