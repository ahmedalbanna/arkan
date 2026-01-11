/**
 * Indexed Documents Management API
 * 
 * Get and manage indexed documents using Firestore tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore } from '@/lib/rag/vector-store';
import { 
  getAllIndexedDocuments, 
  getDocumentStatistics 
} from '@/services/document-tracking-service';

export async function GET(request: NextRequest) {
  try {
    // Get documents from Firestore tracking database
    const documents = await getAllIndexedDocuments();
    
    // Get statistics
    const stats = await getDocumentStatistics();
    
    // Also get Qdrant stats if available
    const vectorStore = getVectorStore();
    let qdrantStats: any = {};
    if (typeof vectorStore.getStats === 'function') {
      qdrantStats = await vectorStore.getStats();
    }

    return NextResponse.json({
      documents,
      totalChunks: stats.totalChunks,
      totalDocuments: stats.totalDocuments,
      projectCount: stats.projectCount,
      recentUploads: stats.recentUploads,
      qdrantTotalChunks: qdrantStats.totalChunks || 0,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching indexed documents:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents',
        documents: [],
        totalChunks: 0,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️  Deleting project: ${projectId}`);

    // 1. Delete from Qdrant vector store
    const vectorStore = getVectorStore();
    if (typeof vectorStore.deleteProjectChunks === 'function') {
      await vectorStore.deleteProjectChunks(projectId);
      console.log(`   ✓ Deleted vectors from Qdrant`);
    }

    // 2. Mark documents as deleted in tracking database
    const { markDocumentDeleted } = await import('@/services/document-tracking-service');
    await markDocumentDeleted(projectId);
    console.log(`   ✓ Marked documents as deleted in tracking database`);

    return NextResponse.json({
      success: true,
      message: `Deleted all chunks for project: ${projectId}`,
    });

  } catch (error) {
    console.error('Error deleting documents:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete documents' },
      { status: 500 }
    );
  }
}
