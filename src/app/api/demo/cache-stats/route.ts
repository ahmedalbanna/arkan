/**
 * Demo Cache Statistics API
 * Get and manage cache statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCacheManager } from '@/modules/rag/infrastructure/cache';

export async function GET(_request: NextRequest) {
  try {
    const cacheManager = getCacheManager();
    const stats = cacheManager.getAllStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const cacheManager = getCacheManager();
    cacheManager.clearAll();

    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
