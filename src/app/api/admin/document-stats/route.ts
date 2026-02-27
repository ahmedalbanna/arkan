/**
 * Document Statistics API
 * 
 * Get comprehensive statistics about indexed documents
 */

import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/di/container';
import { RagController } from '@/modules/rag/adapters/controllers/RagController';

export async function GET() {
  try {
    const controller = container.resolve(RagController);
    const stats = await controller.getStats();

    return NextResponse.json({
      ...stats,
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
