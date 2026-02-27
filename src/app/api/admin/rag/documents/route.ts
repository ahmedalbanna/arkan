/**
 * Indexed Documents Management API
 * 
 * Get and manage indexed documents using Firestore tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

export async function GET(_request: NextRequest) {
  try {
    const controller = container.resolve(RagController);
    const documents = await controller.getIndexedDocuments();
    const stats = await controller.getStats();

    return NextResponse.json({
      documents,
      ...stats,
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

    const controller = container.resolve(RagController);
    await controller.deleteIndexedDocument({ projectId });

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
