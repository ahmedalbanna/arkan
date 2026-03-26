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
    const documentsResult = await controller.getIndexedDocuments();
    const statsResult = await controller.getStats();

    if (documentsResult.isFailure) {
      return NextResponse.json({ error: documentsResult.error?.message || 'Failed to fetch documents' }, { status: 500 });
    }

    if (statsResult.isFailure) {
      return NextResponse.json({ error: statsResult.error?.message || 'Failed to fetch stats' }, { status: 500 });
    }

    return NextResponse.json({
      documents: documentsResult.getValue(),
      ...statsResult.getValue(),
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
