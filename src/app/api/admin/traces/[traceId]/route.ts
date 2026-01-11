/**
 * Execution Trace API
 * 
 * GET /api/admin/traces/[traceId] - Get execution trace details
 */

import { NextRequest, NextResponse } from 'next/server';
import { executionTraceService } from '@/services/execution-trace-service';

/**
 * GET /api/admin/traces/[traceId]
 * Get detailed execution trace for debugging
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { traceId: string } }
) {
  try {
    const trace = await executionTraceService.getTraceById(params.traceId);

    if (!trace) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trace not found',
        },
        { status: 404 }
      );
    }

    // Format trace for display
    const formatted = executionTraceService.formatTrace(trace);

    return NextResponse.json({
      success: true,
      trace,
      formatted,
    });
  } catch (error) {
    console.error('Error getting trace:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get trace',
      },
      { status: 500 }
    );
  }
}
