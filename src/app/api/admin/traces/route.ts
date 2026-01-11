/**
 * Execution Traces List API
 * 
 * GET /api/admin/traces - List execution traces with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { executionTraceService } from '@/services/execution-trace-service';
import { ExecutionStatus } from '@/lib/models/execution-trace';

/**
 * GET /api/admin/traces
 * List execution traces with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const flowId = searchParams.get('flowId') || undefined;
    const flowName = searchParams.get('flowName') || undefined;
    const status = searchParams.get('status') as ExecutionStatus | undefined;
    const userId = searchParams.get('userId') || undefined;
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const hasError = searchParams.get('hasError')
      ? searchParams.get('hasError') === 'true'
      : undefined;
    const minDuration = searchParams.get('minDuration')
      ? parseInt(searchParams.get('minDuration')!)
      : undefined;
    const maxDuration = searchParams.get('maxDuration')
      ? parseInt(searchParams.get('maxDuration')!)
      : undefined;

    const filters: any = {};
    if (flowId) filters.flowId = flowId;
    if (flowName) filters.flowName = flowName;
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (hasError !== undefined) filters.hasError = hasError;
    if (minDuration) filters.minDuration = minDuration;
    if (maxDuration) filters.maxDuration = maxDuration;

    const traces = await executionTraceService.listTraces(filters);

    return NextResponse.json({
      success: true,
      traces,
      total: traces.length,
    });
  } catch (error) {
    console.error('Error listing traces:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list traces',
      },
      { status: 500 }
    );
  }
}
