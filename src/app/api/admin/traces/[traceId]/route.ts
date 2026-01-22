/**
 * Individual Trace API Routes
 * 
 * GET /api/admin/traces/:traceId - Get trace details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getExecutionTraceService } from '@/services/execution-trace-service';

// ============================================================================
// GET - Get Trace by ID
// ============================================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ traceId: string }> }
) {
  try {
    const params = await context.params;
    const { traceId } = params;

    const traceService = getExecutionTraceService();
    const trace = await traceService.getTrace(traceId);

    if (!trace) {
      return NextResponse.json(
        { error: 'Trace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ trace }, { status: 200 });
  } catch (error) {
    console.error('Error getting trace:', error);
    return NextResponse.json(
      { error: 'Failed to get trace', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
