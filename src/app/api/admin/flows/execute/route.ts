/**
 * Flow Execution API Route
 * 
 * POST /api/admin/flows/execute - Execute a flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFlowConfigService } from '@/services/flow-config-service';
import { getExecutionTraceService } from '@/services/execution-trace-service';
import { createEnhancedExecutor } from '@/ai/dynamic-flow/executor';

// ============================================================================
// POST - Execute Flow
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flowId, flowVersion, input, options = {} } = body;

    if (!flowId || !input) {
      return NextResponse.json(
        { error: 'Missing required fields: flowId, input' },
        { status: 400 }
      );
    }

    // Get flow configuration
    const flowService = getFlowConfigService();
    const flowConfig = await flowService.getFlow(flowId, flowVersion);

    if (!flowConfig) {
      return NextResponse.json(
        { error: 'Flow not found' },
        { status: 404 }
      );
    }

    // Check if flow is active
    if (flowConfig.status !== 'active') {
      return NextResponse.json(
        { error: 'Flow is not active' },
        { status: 400 }
      );
    }

    // Start execution trace
    const traceService = getExecutionTraceService();
    const trace = await traceService.startTrace(
      flowConfig.id,
      flowConfig.version,
      input,
      options
    );

    // Execute flow
    const executor = createEnhancedExecutor();
    const result = await executor.execute(flowConfig, input, {
      ...options,
      userId: options.userId,
      sessionId: options.sessionId
    });

    // Complete trace
    await traceService.completeTrace(trace.id, {
      status: result.success ? 'success' : 'error',
      output: result.output,
      error: result.error,
      metrics: result.metrics
    });

    return NextResponse.json({
      success: result.success,
      output: result.output,
      error: result.error?.message,
      traceId: trace.id,
      metrics: result.metrics,
      duration: result.duration
    }, { status: 200 });

  } catch (error) {
    console.error('Error executing flow:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute flow',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
