/**
 * Execution Traces API Routes
 * 
 * GET /api/admin/traces - List traces
 */

import { NextRequest, NextResponse } from 'next/server';
import { getExecutionTraceService } from '@/services/execution-trace-service';

// ============================================================================
// GET - List Traces
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const options = {
      flowId: searchParams.get('flowId') || undefined,
      userId: searchParams.get('userId') || undefined,
      status: searchParams.get('status') as any,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const traceService = getExecutionTraceService();
    const result = await traceService.listTraces(options);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error listing traces:', error);
    return NextResponse.json(
      { error: 'Failed to list traces', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
