/**
 * Analytics API
 * 
 * GET /api/admin/analytics - Get execution analytics for flows
 */

import { NextRequest, NextResponse } from 'next/server';
import { executionTraceService } from '@/services/execution-trace-service';

/**
 * GET /api/admin/analytics
 * Get execution analytics for a specific flow
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flowId = searchParams.get('flowId');
    const period = searchParams.get('period') as 'hour' | 'day' | 'week' | 'month' | null;

    if (!flowId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Flow ID is required',
        },
        { status: 400 }
      );
    }

    const analytics = await executionTraceService.getFlowAnalytics(
      flowId,
      period || 'day'
    );

    if (!analytics) {
      return NextResponse.json(
        {
          success: false,
          error: 'No analytics data available',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics',
      },
      { status: 500 }
    );
  }
}
